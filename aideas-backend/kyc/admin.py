
from django.contrib import admin
from django.utils import timezone
from .models import KYC


@admin.register(KYC)
class KYCAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "submitted_at",
        "reviewed_at",
    )

    list_filter = ("status",)
    search_fields = ("user__username", "pan_number")

    readonly_fields = (
        "user",
        "pan_number",
        "document",
        "submitted_at",
        "reviewed_at",
    )

    def save_model(self, request, obj, form, change):
        if change and "status" in form.changed_data:
            obj.reviewed_at = timezone.now()

            if obj.status != "rejected":
                obj.rejection_reason = ""

        super().save_model(request, obj, form, change)
