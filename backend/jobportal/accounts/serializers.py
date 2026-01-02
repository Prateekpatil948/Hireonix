from rest_framework import serializers
from .models import User, Company, CandidateProfile, RecruiterProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    # extra fields only for recruiter
    company_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    company_website = serializers.URLField(
        write_only=True, required=False, allow_blank=True
    )
    company_description = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
            "company_name",
            "company_website",
            "company_description",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "").strip()
        company_website = validated_data.pop("company_website", "").strip()
        company_description = validated_data.pop(
            "company_description", ""
        ).strip()

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=validated_data["role"],
        )

        # 🔧 Use `about` field from Company model
        if user.role == "recruiter" and company_name:
            Company.objects.create(
                user=user,
                name=company_name,
                website=company_website or None,
                about=company_description,
            )

        return user


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "user",
            "name",
            "website",
            "industry",
            "location",
            "about",
            "company_size",
            "founded_year",
        ]
        # usually you don't allow client to change `user` directly
        read_only_fields = ["id", "user"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "full_name",       # 👈 new
            "phone_number",    # 👈 new
            "bio",
            "skills",
            "experience",
            "resume",
        ]
        read_only_fields = ["user", "username", "email"]
        extra_kwargs = {
            "resume": {"required": False, "allow_null": True},
        }


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for recruiter personal profile.
    """
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "full_name",
            "phone_number",
            "position",
            "linkedin",
            "bio",
        ]
        read_only_fields = ["user", "username", "email"]
