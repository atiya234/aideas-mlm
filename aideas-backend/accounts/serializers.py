from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from users.models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    referral_code = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "referral_code"
        ]

        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_referral_code(self, value):
        value = value.strip().upper()

        if not UserProfile.objects.filter(
            referral_code=value
        ).exists():
            raise serializers.ValidationError(
                "Invalid referral code"
            )

        return value

    @transaction.atomic
    def create(self, validated_data):

        referral_code = validated_data.pop("referral_code")

        referrer = UserProfile.objects.get(
            referral_code=referral_code
        )

        user = User.objects.create_user(**validated_data)

        # The post_save signal creates this profile.
        profile, created = UserProfile.objects.get_or_create(
            user=user
        )

        profile.referred_by = referrer
        profile.save(update_fields=["referred_by"])

        return user


class UserProfileSerializer(serializers.ModelSerializer):

    referral_code = serializers.CharField(
        source="profile.referral_code",
        read_only=True
    )

    referred_by = serializers.CharField(
        source="profile.referred_by.user.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "referral_code",
            "referred_by"
        ]


class DirectReferralSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "referral_code"
        ]


class UserProfileSerializer(serializers.ModelSerializer):

    referral_code = serializers.CharField(
        source="profile.referral_code",
        read_only=True
    )

    referred_by = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "referral_code",
            "referred_by"
        ]

        read_only_fields = [
            "email",
            "referral_code",
            "referred_by"
        ]

    def get_referred_by(self, obj):
        profile = getattr(obj, "profile", None)

        if profile and profile.referred_by:
            return profile.referred_by.user.username

        return None

    def validate_username(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must contain at least 3 characters."
            )

        if User.objects.filter(
            username__iexact=value
        ).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value
