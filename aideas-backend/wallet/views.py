from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.db.models import BigIntegerField, Value
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import WalletTransaction
from .serializers import WalletTransactionSerilaizer



class WalletTransactionsView(generics.ListAPIView):
    serializer_class = WalletTransactionSerilaizer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WalletTransaction.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

class WalletBalanceView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        balance = WalletTransaction.objects.filter(
            user=request.user
        ).aggregate(
            total=Coalesce(
                Sum("amount_paise"),
                Value(0),
                output_field=BigIntegerField()
            )
        )["total"]

        return Response({
            "balance_paise": balance
        })


class AdminWalletTransactionsView(generics.ListAPIView):
    serializer_class = WalletTransactionSerilaizer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return WalletTransaction.objects.select_related(
            "user"
        ).order_by("-created_at", "-id")
