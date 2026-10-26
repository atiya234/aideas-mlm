import secrets

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    role = models.CharField(max_length=10, default="user")

    referral_code = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True
    )

    referred_by = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='direct_referrals'
    )

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.referral_code:
            while True:
                code = "AID" + secrets.token_hex(4).upper()

                if not User.objects.filter(referral_code=code).exists():
                    self.referral_code = code
                    break

        super().save(*args, **kwargs)
