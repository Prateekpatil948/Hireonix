from django.db import models
from accounts.models import Company, CandidateProfile
from decimal import Decimal
from django.utils import timezone


class Job(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50)  # Full-time, Internship etc
    salary_min = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    salary_max = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # 🔹 NEW FIELDS
    qualification = models.CharField(
        max_length=255, blank=True, null=True
    )
    batch = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="e.g. 2022, 2023, 2024"
    )
    skills = models.TextField(
        blank=True, null=True,
        help_text="Comma-separated skills, e.g. React, Django, REST API"
    )
    external_link = models.URLField(
        blank=True, null=True,
        help_text="External apply link (if any)"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



class Application(models.Model):
    STATUS_CHOICES = (
        ("applied", "Applied"),
        ("shortlisted", "Shortlisted"),
        ("selected", "Selected"),
        ("rejected", "Rejected"),
    )

    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="applications"
    )
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="applications"
    )
    cover_letter = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="applied"
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("job", "candidate")

    def __str__(self):
        return f"{self.candidate.user.username} → {self.job.title}"


class SavedJob(models.Model):
    candidate = models.ForeignKey("accounts.CandidateProfile", on_delete=models.CASCADE)
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("candidate", "job")  # prevent duplicates

    def __str__(self):
        return f"{self.candidate.user.username} saved {self.job.title}"
    

class JobAlert(models.Model):
    candidate = models.ForeignKey(
        "accounts.CandidateProfile", on_delete=models.CASCADE, related_name="job_alerts"
    )
    keywords = models.CharField(
        max_length=200,
        help_text="Comma-separated keywords, e.g. React, Django, Backend",
    )
    location = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.candidate.user.username}: {self.keywords}"


class JobAlertNotification(models.Model):
    candidate = models.ForeignKey(
        "accounts.CandidateProfile",
        on_delete=models.CASCADE,
        related_name="job_notifications",
    )
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE)
    alert = models.ForeignKey(
        JobAlert, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.candidate.user.username} - {self.job.title}"


class ApplicationStatusNotification(models.Model):
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="status_notifications",
    )
    status = models.CharField(max_length=20)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Status notification: {self.application.candidate.user.username} - {self.status}"


class Interview(models.Model):
    STATUS_CHOICES = (
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("rescheduled", "Rescheduled"),
    )

    MODE_CHOICES = (
        ("online", "Online"),
        ("onsite", "Onsite"),
        ("phone", "Phone"),
    )

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="interviews"
    )
    scheduled_at = models.DateTimeField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="online")
    location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Meeting link or physical address.",
    )
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="scheduled"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"Interview for {self.application.candidate.user.username} - "
            f"{self.application.job.title} @ {self.scheduled_at}"
        )


class JobTest(models.Model):
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name="test",
    )
    total_marks = models.IntegerField(default=50)
    score = models.IntegerField(null=True, blank=True)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Test for application {self.application_id}"


OPTION_CHOICES = (
    ("A", "Option A"),
    ("B", "Option B"),
    ("C", "Option C"),
    ("D", "Option D"),
)

class JobTestQuestion(models.Model):
    test = models.ForeignKey(
        JobTest,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)

    def __str__(self):
        return f"Q{self.id} - Test {self.test_id}"


class JobTestAnswer(models.Model):
    question = models.ForeignKey(
        JobTestQuestion,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="test_answers",
    )
    selected_option = models.CharField(max_length=1, choices=OPTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("question", "application")

    def __str__(self):
        return f"Answer for Q{self.question_id} - App {self.application_id}"