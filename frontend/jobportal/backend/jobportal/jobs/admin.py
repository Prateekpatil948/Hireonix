from django.contrib import admin
from .models import Job, Application, JobTest, JobTestQuestion, JobTestAnswer

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'job_type', 'is_active', 'created_at')
    list_filter = ('job_type', 'location', 'is_active')
    search_fields = ('title', 'company__name')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'candidate', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('job__title', 'candidate__user__username')


@admin.register(JobTest)
class JobTestAdmin(admin.ModelAdmin):
    list_display = ("application", "score", "total_marks", "passed", "created_at", "completed_at")
    list_filter = ("passed",)


@admin.register(JobTestQuestion)
class JobTestQuestionAdmin(admin.ModelAdmin):
    list_display = ("test", "id", "text")


@admin.register(JobTestAnswer)
class JobTestAnswerAdmin(admin.ModelAdmin):
    list_display = ("application", "question", "selected_option", "created_at")