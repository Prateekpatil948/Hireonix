from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static

from jobs.views import (
    JobViewSet,
    ApplicationViewSet,
    SaveJobView,
    UnsaveJobView,
    SavedJobListView,
    CandidateJobAlertListCreateView,
    CandidateJobAlertDetailView,
    CandidateNotificationListView,
    MarkNotificationReadView,
    RecruiterApplicationsView,
    InterviewViewSet,
    RecruiterAnalyticsView,
    # 🔹 NEW imports
    CandidateApplicationStatusNotificationListView,
    MarkApplicationStatusNotificationReadView,
)

from accounts.views import (
    RegisterView,
    CandidateProfileView,
    MeView,
    CandidateProfileForRecruiterView,
    RecruiterCompanyView,
    RecruiterProfileView,  # ✅ NEW IMPORT
)


router = routers.DefaultRouter()
router.register(r"jobs", JobViewSet, basename="jobs")
router.register(r"applications", ApplicationViewSet, basename="applications")
router.register(r"interviews", InterviewViewSet, basename="interviews")


urlpatterns = [
    path("admin/", admin.site.urls),

    # auth
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", MeView.as_view()),

    # candidate profile
    path("api/candidate/profile/", CandidateProfileView.as_view()),

    # recruiter
    path("api/recruiter/profile/", RecruiterProfileView.as_view(), name="recruiter-profile"),  # ✅ ADDED
    path("api/recruiter/candidates/<int:pk>/", CandidateProfileForRecruiterView.as_view()),
    path("api/recruiter/applications/", RecruiterApplicationsView.as_view()),
    path("api/recruiter/company/", RecruiterCompanyView.as_view(), name="recruiter-company"),
    path("api/recruiter/analytics/", RecruiterAnalyticsView.as_view(), name="recruiter-analytics"),

    # Saved jobs
    path("api/saved/", SavedJobListView.as_view(), name="saved-jobs"),
    path("api/saved/add/", SaveJobView.as_view(), name="save-job"),
    path("api/saved/remove/<int:job_id>/", UnsaveJobView.as_view(), name="unsave-job"),

    # Job alerts & notifications
    path("api/alerts/", CandidateJobAlertListCreateView.as_view(), name="job-alerts"),
    path("api/alerts/<int:pk>/", CandidateJobAlertDetailView.as_view(), name="job-alert-detail"),
    path("api/alerts/notifications/", CandidateNotificationListView.as_view(), name="job-alert-notifications"),
    path("api/alerts/notifications/<int:pk>/read/", MarkNotificationReadView.as_view(), name="job-alert-notification-read"),

    # 🔹 NEW: Application status notifications (backend mirror of the emails)
    path(
        "api/alerts/application-status/",
        CandidateApplicationStatusNotificationListView.as_view(),
        name="application-status-notifications",
    ),
    path(
        "api/alerts/application-status/<int:pk>/read/",
        MarkApplicationStatusNotificationReadView.as_view(),
        name="application-status-notification-read",
    ),

    # router (jobs, applications, interviews)
    path("api/", include(router.urls)),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
