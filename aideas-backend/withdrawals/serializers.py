
from rest_framework import serializers
from .models import Withdrawal


class WithdrawalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Withdrawal
        fields = [
            "id",
            "username",
            "amount_paise",
            "status",
            "payout_reference",
            "failure_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
class WithdrawalRequestSerializer(serializers.Serializer):
    amount_paise = serializers.IntegerField(
        min_value=100
    )
