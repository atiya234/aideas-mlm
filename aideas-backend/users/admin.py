from django.contrib import admin
from .models import ReferralLevel


# Register your models here.
@admin.register(ReferralLevel)
class ReferralLevelAdmin(admin.ModelAdmin):
    list_display = (
        "level",
        "percentage",
        "min_direct_referrals"
    )
