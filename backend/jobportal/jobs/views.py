from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from accounts.models import Company, CandidateProfile

import re
from django.db.models import Q, Count
from django.http import FileResponse, Http404

from datetime import timedelta
from django.utils import timezone

from .email_utils import send_application_status_email
from .test_utils import create_test_for_application

from .models import (
    Job,
    Application,
    SavedJob,
    JobAlert,
    JobAlertNotification,
    Interview,
    JobTestQuestion,
    JobTestAnswer,
    JobTest,
    ApplicationStatusNotification,  # 🔹 NEW
)
from .serializers import (
    JobSerializer,
    ApplicationSerializer,
    SavedJobSerializer,
    JobAlertSerializer,
    JobAlertNotificationSerializer,
    InterviewSerializer,
    JobTestSerializer,
    JobTestAnswerInputSerializer,
    JobTestResultSerializer,
    ApplicationStatusNotificationSerializer,  # 🔹 NEW
)


class IsRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "recruiter"
        )


class IsCandidate(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "candidate"
        )


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "my_jobs",
            "applications",
        ]:
            permission_classes = [permissions.IsAuthenticated, IsRecruiter]
        elif self.action == "apply":
            permission_classes = [permissions.IsAuthenticated, IsCandidate]
        else:
            permission_classes = [permissions.AllowAny]
        return [p() for p in permission_classes]

    def get_queryset(self):
        """
        - Public (list / retrieve / apply): only active jobs + filters
        - Recruiter actions (update/partial_update/destroy/my_jobs/applications):
          all jobs owned by that recruiter (active + inactive)
        """
        user = self.request.user
        base_qs = Job.objects.all().order_by("-created_at")

        # 🔹 For recruiter-only actions: see ALL their jobs (active + inactive)
        if self.action in [
            "update",
            "partial_update",
            "destroy",
            "my_jobs",
            "applications",
        ]:
            if user.is_authenticated and getattr(user, "role", None) == "recruiter":
                return base_qs.filter(company__user=user)
            return Job.objects.none()

        # 🔹 Default: public – only active jobs
        qs = base_qs.filter(is_active=True)

        # Only apply filters for the list endpoint
        if self.action == "list":
            params = self.request.query_params
            search = params.get("search")  # keyword
            location = params.get("location")
            job_type = params.get("job_type")

            if search:
                search = search.strip()
                qs = qs.filter(
                    Q(title__icontains=search)
                    | Q(description__icontains=search)
                    | Q(company__name__icontains=search)
                )

            if location:
                qs = qs.filter(location__icontains=location.strip())

            if job_type:
                qs = qs.filter(job_type__icontains=job_type.strip())

        return qs

    def perform_create(self, serializer):
        user = self.request.user

        # --- recruiter/company logic ---
        if getattr(user, "role", None) != "recruiter":
            raise ValidationError("Only recruiters can create jobs.")

        company = Company.objects.filter(user=user).first()
        if not company:
            company = Company.objects.create(
                user=user,
                name=f"{user.username}'s Company",
                website="",
                description="",
            )

        job = serializer.save(company=company)

        # 🔔 Job alert matching logic
        text = f"{job.title} {job.description}".lower()
        job_location = (job.location or "").lower()
        job_type = (job.job_type or "").lower()

        alerts = JobAlert.objects.filter(is_active=True).select_related(
            "candidate__user"
        )

        notifications_to_create = []

        for alert in alerts:
            alert_location = (alert.location or "").lower()
            alert_job_type = (alert.job_type or "").lower()

            # Match keywords
            keywords_text = alert.keywords or ""
            keywords = [
                k.strip().lower()
                for k in re.split(r"[,\n]", keywords_text)
                if k.strip()
            ]

            if keywords:
                matched = False
                for kw in keywords:
                    if kw and kw in text:
                        matched = True
                        break
                if not matched:
                    continue

            # Optional: match location
            if alert_location and alert_location not in job_location:
                continue

            # Optional: match job type
            if alert_job_type and alert_job_type != job_type:
                continue

            notifications_to_create.append(
                JobAlertNotification(candidate=alert.candidate, job=job, alert=alert)
            )

        if notifications_to_create:
            JobAlertNotification.objects.bulk_create(notifications_to_create)

    @action(detail=False, methods=["get"], url_path="my-jobs")
    def my_jobs(self, request):
        user = request.user
        qs = Job.objects.filter(company__user=user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="applications")
    def applications(self, request, pk=None):
        job = self.get_object()
        apps = job.applications.select_related("candidate__user")
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="apply")
    def apply(self, request, pk=None):
        """
        Old-style apply endpoint: POST /api/jobs/<id>/apply/
        Still supported. Also creates test + sends email.
        """
        job = self.get_object()
        user = request.user

        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"detail": "Complete your candidate profile before applying."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Application.objects.filter(job=job, candidate=candidate_profile).exists():
            return Response(
                {"detail": "You have already applied to this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cover_letter = request.data.get("cover_letter", "")

        application = Application.objects.create(
            job=job,
            candidate=candidate_profile,
            cover_letter=cover_letter,
        )

        # 🔹 Create test as well
        try:
            create_test_for_application(application)
        except Exception as e:
            print("Error creating test from JobViewSet.apply:", e)

        # 🔔 Send email
        try:
            send_application_status_email(application)
        except Exception as e:
            print("Error sending status email from JobViewSet.apply:", e)

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def recommended(self, request):
        """
        GET /api/jobs/recommended/

        Returns a list of recommended jobs for the logged-in candidate,
        based on their skills and excluding already-applied jobs.
        """
        user = request.user

        # Only for candidates
        if getattr(user, "role", None) != "candidate":
            return Response([], status=200)

        # Ensure candidate profile exists
        profile, _ = CandidateProfile.objects.get_or_create(user=user)

        skills_text = profile.skills or ""
        # split on comma or newline
        skills = [
            s.strip().lower()
            for s in re.split(r"[,\n]", skills_text)
            if s.strip()
        ]

        # If no skills yet, just return latest active jobs
        base_qs = Job.objects.filter(is_active=True).order_by("-created_at")

        # Exclude jobs already applied by this candidate
        applied_job_ids = Application.objects.filter(
            candidate__user=user
        ).values_list("job_id", flat=True)

        base_qs = base_qs.exclude(id__in=applied_job_ids)

        if not skills:
            jobs = base_qs[:10]
            serializer = JobSerializer(jobs, many=True)
            return Response(serializer.data)

        # Score jobs by skill overlap
        scored = []
        for job in base_qs:
            text = f"{job.title} {job.description}".lower()
            score = 0
            for skill in skills:
                if skill and skill in text:
                    score += 1

            if score > 0:
                scored.append((score, job))

        # Sort by score (desc) then newest first
        scored.sort(key=lambda x: (-x[0], -x[1].created_at.timestamp()))

        # Top 10 recommended
        jobs = [j for _, j in scored[:10]]
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by("-applied_at")
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="download-resume")
    def download_resume(self, request, pk=None):
        """Allow recruiter to download candidate resume for this application."""
        application = self.get_object()

        user = request.user
        # Only recruiters who own the job's company can download the resume
        if getattr(user, "role", None) != "recruiter":
            return Response(
                {"detail": "Only recruiters can download resumes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job_company_user = getattr(
            getattr(application.job, "company", None), "user", None
        )
        if job_company_user is not None and job_company_user != user:
            return Response(
                {"detail": "You do not have permission to access this application."},
                status=status.HTTP_403_FORBIDDEN,
            )

        resume = getattr(application.candidate, "resume", None)
        if not resume:
            # No resume uploaded
            raise Http404("No resume uploaded for this candidate.")

        # Derive a safe filename
        username = getattr(
            getattr(application.candidate, "user", None), "username", "candidate"
        )
        original_name = resume.name.split("/")[-1]
        filename = original_name or f"{username}-resume"

        return FileResponse(
            resume.open("rb"),
            as_attachment=True,
            filename=filename,
        )

    @action(detail=True, methods=["get", "post"], url_path="interviews")
    def interviews(self, request, pk=None):
        """List or create interviews for this application (recruiter side)."""
        application = self.get_object()
        user = request.user

        # Only recruiters who own this job can manage interviews
        if getattr(user, "role", None) != "recruiter":
            return Response(
                {"detail": "Only recruiters can manage interviews."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job_company_user = getattr(
            getattr(application.job, "company", None), "user", None
        )
        if job_company_user is not None and job_company_user != user:
            return Response(
                {"detail": "You do not have permission to access this application."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.method.lower() == "get":
            qs = Interview.objects.filter(
                application=application
            ).order_by("-scheduled_at")
            serializer = InterviewSerializer(qs, many=True)
            return Response(serializer.data)

        # POST: create a new interview
        data = request.data.copy()
        serializer = InterviewSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        interview = serializer.save(application=application)
        return Response(
            InterviewSerializer(interview).data, status=status.HTTP_201_CREATED
        )

    def perform_create(self, serializer):
        """
        When candidate applies via /api/applications/:
        1. Ensure user is a candidate profile
        2. Check duplicate application for same job
        3. Save application with candidate
        4. Create test via Groq
        5. Send 'applied' email
        """
        user = self.request.user

        # 1) Must have candidate profile
        try:
            candidate = CandidateProfile.objects.get(user=user)
        except CandidateProfile.DoesNotExist:
            raise ValidationError({"detail": "Only candidates can apply for jobs."})

        # 2) Check duplicate for this job + candidate
        job = serializer.validated_data.get("job")
        if Application.objects.filter(job=job, candidate=candidate).exists():
            raise ValidationError({"detail": "You have already applied for this job."})

        # 3) Save application with candidate attached
        application = serializer.save(candidate=candidate)

        # 4) Create test via Groq – don't block on errors
        try:
            create_test_for_application(application)
        except Exception as e:
            print("Error creating test:", e)

        # 5) Send status email – don't block on errors
        try:
            send_application_status_email(application)
        except Exception as e:
            print("Error sending application email:", e)

    @action(
        detail=True,
        methods=["get"],
        url_path="test",
        permission_classes=[permissions.IsAuthenticated],
    )
    def candidate_test(self, request, pk=None):
        """
        Candidate: GET /api/applications/<id>/test/
        Returns test + questions (without correct options).
        """
        application = self.get_object()

        # Only that candidate can view their test
        if (
            getattr(request.user, "role", None) != "candidate"
            or application.candidate.user != request.user
        ):
            return Response(
                {"detail": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        test = getattr(application, "test", None)
        if not test:
            # Try to (re)create if missing
            test = create_test_for_application(application)

        if not test:
            return Response(
                {"detail": "Test not available for this application."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = JobTestSerializer(test)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_path="submit-test",
        permission_classes=[permissions.IsAuthenticated],
    )
    def submit_test(self, request, pk=None):
        """
        Candidate: POST /api/applications/<id>/submit-test/
        body: { "answers": [ { "question_id": 1, "selected_option": "A" }, ... ] }
        """
        application = self.get_object()

        # Only that candidate can submit their test
        if (
            getattr(request.user, "role", None) != "candidate"
            or application.candidate.user != request.user
        ):
            return Response(
                {"detail": "Not allowed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        test = getattr(application, "test", None)
        if not test:
            return Response(
                {"detail": "Test not available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 🚫 Block if already completed once (no re-attempt)
        if test.completed_at is not None:
            return Response(
                {"detail": "You have already completed this test."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers_data = request.data.get("answers", [])
        if not isinstance(answers_data, list):
            return Response(
                {"detail": "answers must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_score = 0

        for ans in answers_data:
            ser = JobTestAnswerInputSerializer(data=ans)
            ser.is_valid(raise_exception=True)

            q_id = ser.validated_data["question_id"]
            selected = ser.validated_data["selected_option"]

            try:
                question = JobTestQuestion.objects.get(id=q_id, test=test)
            except JobTestQuestion.DoesNotExist:
                continue

            JobTestAnswer.objects.update_or_create(
                question=question,
                application=application,
                defaults={"selected_option": selected},
            )

            if question.correct_option == selected:
                total_score += 2  # 2 marks per correct

        # ✅ Update test
        test.score = total_score
        # 30 is your current pass threshold (60% of 50 marks)
        passed = total_score > 30
        test.passed = passed
        test.completed_at = timezone.now()
        test.save()

        # ✅ Update application status based on result
        if passed:
            # If score > 30 => shortlist
            if application.status != "shortlisted":
                application.status = "shortlisted"
                application.save(update_fields=["status"])

                # Optional: send email that candidate is shortlisted
                try:
                    send_application_status_email(application)
                except Exception as e:
                    print("Error sending status email:", e)
        else:
            # ❌ Failed => mark as rejected
            if application.status != "rejected":
                application.status = "rejected"
                application.save(update_fields=["status"])

                # Optional: send email that candidate is rejected
                try:
                    send_application_status_email(application)
                except Exception as e:
                    print("Error sending status email:", e)

        return Response(
            {
                "score": total_score,
                "total": test.total_marks,
                "passed": test.passed,
                "application_status": application.status,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="test-results",
        permission_classes=[permissions.IsAuthenticated],
    )
    def recruiter_test_results(self, request, pk=None):
        """
        Recruiter: GET /api/applications/<id>/test-results/
        See candidate answers vs correct answers.
        """
        application = self.get_object()
        user = request.user

        # Only recruiter who owns the job's company
        if (
            getattr(user, "role", None) != "recruiter"
            or application.job.company.user != user
        ):
            return Response(
                {"detail": "Only the job's recruiter can view test results."},
                status=status.HTTP_403_FORBIDDEN,
            )

        test = getattr(application, "test", None)
        if not test:
            return Response(
                {"detail": "Test not available for this application."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = JobTestResultSerializer(
            test, context={"application": application}
        )
        return Response(serializer.data)
    
    
    def perform_update(self, serializer):
        """
        When an application is updated (usually by recruiter changing status),
        send a status email + create an application status notification
        IF the status actually changed.
        """
        # Current state before save
        instance = self.get_object()
        old_status = instance.status

        # Save updates
        application = serializer.save()

        # If status changed, trigger email + notification
        if application.status != old_status:
            try:
                send_application_status_email(application)
            except Exception as e:
                print("Error sending application status email on update:", e)


class SaveJobView(generics.CreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        job_id = request.data.get("job_id")

        if not job_id:
            return Response({"detail": "job_id required"}, status=400)

        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        saved, created = SavedJob.objects.get_or_create(
            candidate=profile, job_id=job_id
        )

        if not created:
            return Response({"message": "Already saved"}, status=200)

        return Response({"message": "Job saved!"}, status=201)


class UnsaveJobView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        job_id = kwargs.get("job_id")
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        SavedJob.objects.filter(candidate=profile, job_id=job_id).delete()
        return Response({"message": "Job removed from saved"}, status=200)


class SavedJobListView(generics.ListAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return SavedJob.objects.filter(candidate=profile).order_by("-saved_at")


class CandidateJobAlertListCreateView(generics.ListCreateAPIView):
    serializer_class = JobAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return JobAlert.objects.filter(candidate=profile).order_by("-created_at")

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class CandidateJobAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return JobAlert.objects.filter(candidate=profile)


class CandidateNotificationListView(generics.ListAPIView):
    serializer_class = JobAlertNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return JobAlertNotification.objects.filter(candidate=profile)


class MarkNotificationReadView(generics.UpdateAPIView):
    """
    Mark a job alert notification as read.
    """
    serializer_class = JobAlertNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return JobAlertNotification.objects.filter(candidate=profile)

    def patch(self, request, *args, **kwargs):
        # mark as read
        instance = self.get_object()
        instance.is_read = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# 🔹 NEW: application status notifications (emails mirrored into DB)


class CandidateApplicationStatusNotificationListView(generics.ListAPIView):
    """
    List application status updates for the logged-in candidate.
    """
    serializer_class = ApplicationStatusNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return ApplicationStatusNotification.objects.filter(
            application__candidate=profile
        ).order_by("-created_at")


class MarkApplicationStatusNotificationReadView(generics.UpdateAPIView):
    """
    Mark an application status notification as read.
    """
    serializer_class = ApplicationStatusNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return ApplicationStatusNotification.objects.filter(
            application__candidate=profile
        )

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_read = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class RecruiterApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Allow only recruiters
        if getattr(user, "role", None) != "recruiter":
            return Application.objects.none()

        qs = Application.objects.select_related(
            "job", "candidate__user"
        ).filter(job__company__user=user)

        params = self.request.query_params
        search = params.get("search")  # candidate name or email
        job_title = params.get("job")  # job title filter
        status_param = params.get("status")  # applied, shortlisted, rejected, selected

        # 🔍 Search candidate by name or email
        if search:
            qs = qs.filter(
                Q(candidate__user__username__icontains=search)
                | Q(candidate__user__email__icontains=search)
            )

        # 🎯 Filter by job title
        if job_title:
            qs = qs.filter(job__title__icontains=job_title)

        # 🏷 Filter by application status
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by("-applied_at")


class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().order_by("-scheduled_at")
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        role = getattr(user, "role", None)

        if role == "recruiter":
            # Interviews for jobs owned by this recruiter
            qs = qs.filter(application__job__company__user=user)
        elif role == "candidate":
            # Interviews for this candidate
            qs = qs.filter(application__candidate__user=user)
        else:
            qs = Interview.objects.none()

        return qs

    def perform_create(self, serializer):
        # Force creation via ApplicationViewSet action
        raise ValidationError(
            "Use /api/applications/<id>/interviews/ to create interviews."
        )


class RecruiterAnalyticsView(generics.GenericAPIView):
    """
    GET /api/recruiter/analytics/

    Returns stats for the logged-in recruiter:
    - total_jobs
    - active_jobs
    - total_applications
    - applications_today
    - applications_last_7_days
    - applications_by_status
    - applications_per_job
    """
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request, *args, **kwargs):
        user = request.user

        # All jobs created by this recruiter
        jobs_qs = Job.objects.filter(company__user=user)

        # All applications for those jobs
        applications_qs = Application.objects.filter(job__in=jobs_qs)

        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        last_7_days = now - timedelta(days=7)

        total_jobs = jobs_qs.count()
        active_jobs = jobs_qs.filter(is_active=True).count()

        total_applications = applications_qs.count()
        applications_today = applications_qs.filter(
            applied_at__gte=start_of_today
        ).count()
        applications_last_7_days = applications_qs.filter(
            applied_at__gte=last_7_days
        ).count()

        # Applications grouped by status
        status_counts_qs = (
            applications_qs.values("status")
            .annotate(count=Count("id"))
            .order_by()
        )
        applications_by_status = {
            row["status"]: row["count"] for row in status_counts_qs
        }

        # Applications per job (top jobs first)
        apps_per_job_qs = (
            applications_qs.values("job_id", "job__title")
            .annotate(applications_count=Count("id"))
            .order_by("-applications_count")
        )
        applications_per_job = [
            {
                "job_id": row["job_id"],
                "job_title": row["job__title"],
                "applications_count": row["applications_count"],
            }
            for row in apps_per_job_qs
        ]

        data = {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "applications_today": applications_today,
            "applications_last_7_days": applications_last_7_days,
            "applications_by_status": applications_by_status,
            "applications_per_job": applications_per_job,
        }

        return Response(data, status=status.HTTP_200_OK)
