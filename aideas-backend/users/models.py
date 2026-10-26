from django.db import models
from django.conf import settings
import uuid


def generate_referral_code():
    return uuid.uuid4().hex[:10].upper()


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    referral_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_referral_code
    )

    referred_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="direct_referrals"
    )

    def __str__(self):
        return self.user.username

class ReferralLevel(models.Model):
    level = models.PositiveSmallIntegerField(unique=True)
    percentage = models.DecimalField(
        max_digits = 5,
        decimal_places=2,
        null=True,
        blank=True
    )

    min_direct_referrals = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"level{self.level}"
