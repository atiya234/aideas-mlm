
from django.db import models
from django.conf import settings


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ("investment_roi", "Investment ROI"),
        ("direct_referral_bonus", "Direct Referral Bonus"),
        ("level_roi", "Level ROI"),
        ("revenue_share", "Revenue Share"),
        ("withdrawal", "Withdrawal"),
        ("refund", "Refund"),
        ("adjustment", "Adjustment"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="wallet_transactions"
    )

    transaction_type = models.CharField(
        max_length=30,
        choices=TRANSACTION_TYPES
    )

    amount_paise = models.BigIntegerField()

    reference = models.CharField(
        max_length=150,
        unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount_paise}"
