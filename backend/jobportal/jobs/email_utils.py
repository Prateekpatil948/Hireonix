from django.core.mail import send_mail
from django.conf import settings
from .models import ApplicationStatusNotification


def send_application_status_email(application):
    """
    Sends an email to the candidate when the application status changes
    AND stores a notification in the database.
    """
    user = application.candidate.user
    email = user.email
    if not email:
        return  # no email, nothing to do

    job = application.job
    status = application.status

    subject = f"Update on your application for {job.title}"
    base_message = f"Hi {user.username},\n\n"
    base_message += (
        f"Your application for the job '{job.title}' at {job.company.name} "
        f"has been updated.\n\n"
    )

    if status == "applied":
        body_extra = (
            "Status: Applied.\n"
            "Your application has been received. We will review it and get back to you."
        )
    elif status == "shortlisted":
        body_extra = (
            "Status: Shortlisted.\n"
            "Good news! You have been shortlisted for the next round."
        )
    elif status == "selected":
        body_extra = (
            "Status: Selected.\n"
            "Congratulations! You have been selected for this position."
        )
    elif status == "rejected":
        body_extra = (
            "Status: Rejected.\n"
            "Thank you for applying. Unfortunately, you were not selected for this role."
        )
    else:
        body_extra = f"Status: {status}."

    message = base_message + body_extra + "\n\nBest regards,\nJobPortal Team"

    # 🔔 send email
    send_mail(
        subject,
        message,
        getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@jobportal.com"),
        [email],
        fail_silently=True,
    )

    # 🔔 also store for frontend alerts
    ApplicationStatusNotification.objects.create(
        application=application,
        status=status,
        message=body_extra,
    )
