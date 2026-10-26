
from django.db import models
from django.conf import settings


class Withdrawal(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="withdrawals"
    )

    amount_paise = models.PositiveBigIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    payout_reference = models.CharField(
        max_length=150,
        unique=True,
        null=True,
        blank=True
    )

    failure_reason = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Withdrawal {self.id} - {self.user.username}"



class PayoutAccount(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="payout_account"
    )

    razorpay_contact_id = models.CharField(
        max_length=100,
        blank=True
    )

    razorpay_fund_account_id = models.CharField(
        max_length=100,
        blank=True
    )

    is_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Payout Account - {self.user.username}"
