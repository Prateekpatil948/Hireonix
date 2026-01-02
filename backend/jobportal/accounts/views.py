from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import (
    RegisterSerializer,
    CandidateProfileSerializer,
    UserSerializer,
    CompanySerializer,
    RecruiterProfileSerializer,
)
from .models import CandidateProfile, Company, RecruiterProfile


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CandidateProfileForRecruiterView(generics.RetrieveAPIView):
    """
    GET /api/recruiter/candidates/<id>/

    Returns CandidateProfile + username/email.
    For now, any authenticated user can call it, but
    we will only use it from recruiter UI.
    """
    queryset = CandidateProfile.objects.select_related("user")
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecruiterCompanyView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        # (Optional) Only allow recruiters
        # if user.role != "recruiter":
        #     raise PermissionDenied("Only recruiters can manage company details.")

        company, _ = Company.objects.get_or_create(
            user=user,
            defaults={
                "name": f"{user.username}'s Company",
                "website": "",
                "about": "",
            },
        )
        return company


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/recruiter/profile/  → get logged-in recruiter profile
    PUT/PATCH /api/recruiter/profile/  → update profile
    """
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        # (Optional) Only allow recruiters:
        # if user.role != "recruiter":
        #     raise PermissionDenied("Only recruiters can update recruiter profile.")

        profile, _ = RecruiterProfile.objects.get_or_create(user=user)
        return profile
