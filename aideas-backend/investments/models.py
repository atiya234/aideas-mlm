
from django.db import models
from django.conf import settings
from orders.models import Order


class Investment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.PROTECT,
        related_name="investment"
    )

    principal_paise = models.PositiveBigIntegerField()

    roi_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default="0.50"
    )

    roi_duration_working_days = models.PositiveIntegerField(
        default=200
    )

    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Investment {self.id} - {self.user.username}"


class Holiday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} - {self.date}"


class DailyROI(models.Model):
    investment = models.ForeignKey(
        Investment,
        on_delete=models.PROTECT,
        related_name="daily_rois"
    )

    roi_date = models.DateField()
    amount_paise = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["investment", "roi_date"],
                name="unique_daily_roi_per_investment"
            )
        ]

    def __str__(self):
        return f"Investment {self.investment_id} - {self.roi_date}"
