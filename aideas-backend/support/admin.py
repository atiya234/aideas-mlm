
from django.contrib import admin
from .models import SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "subject",
        "status",
        "created_at",
    )

    list_filter = ("status", "created_at")

    search_fields = (
        "subject",
        "message",
        "user__username",
    )

    readonly_fields = (
        "user",
        "subject",
        "message",
        "created_at",
        "updated_at",
    )
