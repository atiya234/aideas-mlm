
from rest_framework import serializers
from .models import SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = SupportTicket

        fields = [
            "id",
            "username",
            "subject",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "status",
            "created_at",
            "updated_at",
        ]
