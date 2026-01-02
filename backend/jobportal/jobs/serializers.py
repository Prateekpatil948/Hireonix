from rest_framework import serializers
from .models import (
    Job,
    Application,
    SavedJob,
    JobAlert,
    JobAlertNotification,
    Interview,
    JobTest,
    JobTestAnswer,
    JobTestQuestion,
    ApplicationStatusNotification, 
)


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["company"]


# ===========================
#   JOB TEST SERIALIZERS
# ===========================

class JobTestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTestQuestion
        fields = [
            "id",
            "text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
        ]  # no correct_option for candidate side


class JobTestSerializer(serializers.ModelSerializer):
    questions = JobTestQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = JobTest
        fields = [
            "id",
            "application",
            "total_marks",
            "score",
            "passed",
            "completed_at",  # ✅ used to disable Take Test button
            "questions",
        ]
        read_only_fields = ["score", "passed", "application", "completed_at"]


class JobTestAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.ChoiceField(choices=["A", "B", "C", "D"])


class JobTestQuestionResultSerializer(serializers.ModelSerializer):
    candidate_answer = serializers.SerializerMethodField()

    class Meta:
        model = JobTestQuestion
        fields = [
            "id",
            "text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
            "candidate_answer",
        ]

    def get_candidate_answer(self, obj):
        application = self.context["application"]
        ans = obj.answers.filter(application=application).first()
        return ans.selected_option if ans else None


class JobTestResultSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = JobTest
        fields = [
            "id",
            "application",
            "total_marks",
            "score",
            "passed",
            "questions",
        ]

    def get_questions(self, obj):
        application = self.context["application"]
        qs = obj.questions.all()
        return JobTestQuestionResultSerializer(
            qs, many=True, context={"application": application}
        ).data


# ===========================
#   APPLICATION / INTERVIEW
# ===========================

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        write_only=True,
        source="job",
    )
    candidate = serializers.PrimaryKeyRelatedField(read_only=True)
    candidate_username = serializers.CharField(
        source="candidate.user.username", read_only=True
    )

    # ✅ Include test so frontend can see completed_at / score / passed
    test = JobTestSerializer(read_only=True)

    class Meta:
        model = Application
        fields = "__all__"
        read_only_fields = ["applied_at"]


class InterviewSerializer(serializers.ModelSerializer):
    application_id = serializers.IntegerField(source="application.id", read_only=True)
    candidate_username = serializers.CharField(
        source="application.candidate.user.username", read_only=True
    )
    job_title = serializers.CharField(
        source="application.job.title", read_only=True
    )

    class Meta:
        model = Interview
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "application"]


# ===========================
#   SAVED JOBS & ALERTS
# ===========================

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = "__all__"


class JobAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAlert
        fields = "__all__"
        read_only_fields = ["candidate", "created_at"]


class JobAlertNotificationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    job_id = serializers.IntegerField(source="job.id", read_only=True)  # ⭐ add this

    class Meta:
        model = JobAlertNotification
        fields = [
            "id",
            "job_title",
            "company_name",
            "job_id",        # ⭐ include here
            "is_read",
            "created_at",
        ]



# ===========================
#   APPLICATION STATUS NOTIFICATIONS
# ===========================

class ApplicationStatusNotificationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="application.job.title", read_only=True)
    company_name = serializers.CharField(source="application.job.company.name", read_only=True)
    job_id = serializers.IntegerField(source="application.job.id", read_only=True)  # ⭐ add this

    class Meta:
        model = ApplicationStatusNotification
        fields = [
            "id",
            "job_title",
            "company_name",
            "job_id",         # ⭐ include here
            "status",
            "message",
            "is_read",
            "created_at",
        ]
