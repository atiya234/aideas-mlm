
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Withdrawal
from .serializers import WithdrawalSerializer


class MyWithdrawalsView(generics.ListAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Withdrawal.objects.filter(
            user=self.request.user
        ).select_related("user").order_by("-created_at")


class AdminWithdrawalsView(generics.ListAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Withdrawal.objects.select_related(
            "user"
        ).order_by("-created_at")
