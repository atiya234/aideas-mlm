
from rest_framework import serializers
from .models import WalletTransaction


class WalletTransactionSerilaizer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = WalletTransaction

        fields = [
            "id",
            "username",
            "transaction_type",
            "amount_paise",
            "reference",
            "created_at",
        ]
