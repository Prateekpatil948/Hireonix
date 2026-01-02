from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("recruiter", "Recruiter"),
        ("candidate", "Candidate"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)

    company_size = models.CharField(
        max_length=50,
        choices=[
            ("small", "Small (1–50 employees)"),
            ("medium", "Medium (51–200 employees)"),
            ("large", "Large (200+ employees)"),
        ],
        blank=True,
        null=True
    )

    founded_year = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return self.name


class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # 🔹 New fields
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    experience = models.IntegerField(default=0)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

    def __str__(self):
        return self.user.username


class RecruiterProfile(models.Model):
    """
    Personal profile for recruiter (not company details).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    position = models.CharField(
        max_length=255,
        blank=True,
        help_text="Job title/role in the company, e.g. HR Manager"
    )
    linkedin = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"RecruiterProfile for {self.user.username}"
