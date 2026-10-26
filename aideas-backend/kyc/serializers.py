
import re
from pathlib import Path

from rest_framework import serializers
from .models import KYC


class KYCSerializer(serializers.ModelSerializer):

    class Meta:
        model = KYC

        fields = [
            "id",
            "pan_number",
            "document",
            "status",
            "rejection_reason",
            "submitted_at",
            "reviewed_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "rejection_reason",
            "submitted_at",
            "reviewed_at",
        ]

    # Validate PAN number
    def validate_pan_number(self, value):
        value = value.strip().upper()

        pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"

        if not re.fullmatch(pattern, value):
            raise serializers.ValidationError(
                "Enter a valid 10-character PAN number."
            )

        return value

    # Validate uploaded document
    def validate_document(self, value):
        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Document size must not exceed 5 MB."
            )

        allowed_extensions = {
            ".pdf", ".jpg", ".jpeg", ".png"
        }

        extension = Path(value.name).suffix.lower()

        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            )

        # Check basic file signatures, not just the extension.
        position = value.tell()
        try:
            value.seek(0)
            header = value.read(8)
        finally:
            value.seek(position)

        valid_signature = {
            ".pdf": header.startswith(b"%PDF-"),
            ".jpg": header.startswith(b"\xff\xd8\xff"),
            ".jpeg": header.startswith(b"\xff\xd8\xff"),
            ".png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        }

        if not valid_signature[extension]:
            raise serializers.ValidationError(
                "File content does not match its extension."
            )

        return value
