from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):
    """
    Allow access only to users with role = 'recruiter'
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role == 'recruiter'
        )


class IsCandidate(BasePermission):
    """
    Allow access only to users with role = 'candidate'
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role == 'candidate'
        )
