

# Create your views here.

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Investment, DailyROI
from wallet.models import WalletTransaction


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_investments(request):
    investments = Investment.objects.filter(
        user=request.user
    ).select_related("order").order_by("-id")

    data = [
        {
            "id": investment.id,
            "order_id": investment.order_id,
            "principal_paise": investment.principal_paise,
            "roi_percent": str(investment.roi_percent),
            "roi_duration_working_days": investment.roi_duration_working_days,
            "started_at": investment.started_at,
        }
        for investment in investments
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_daily_roi_history(request):
    records = DailyROI.objects.filter(
        investment__user=request.user
    ).select_related("investment").order_by("-roi_date", "-id")

    data = [
        {
            "id": record.id,
            "investment_id": record.investment_id,
            "roi_date": record.roi_date,
            "amount_paise": record.amount_paise,
        }
        for record in records
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_level_roi_history(request):
    records = WalletTransaction.objects.filter(
        user=request.user,
        transaction_type="level_roi"
    ).order_by("-created_at", "-id")

    data = [
        {
            "id": record.id,
            "amount_paise": record.amount_paise,
            "reference": record.reference,
            "created_at": record.created_at,
        }
        for record in records
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_investments(request):

    investments = Investment.objects.select_related(
        "user", "order"
    ).order_by("-id")

    data = [
        {
            "id": investment.id,
            "username": investment.user.username,
            "order_id": investment.order_id,
            "principal_paise": investment.principal_paise,
            "roi_percent": str(investment.roi_percent),
            "roi_duration_working_days": investment.roi_duration_working_days,
            "started_at": investment.started_at,
        }
        for investment in investments
    ]

    return Response(data)



@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_daily_roi_history(request):

    records = DailyROI.objects.select_related(
        "investment__user"
    ).order_by("-roi_date", "-id")

    data = [
        {
            "id": record.id,
            "investment_id": record.investment_id,
            "username": record.investment.user.username,
            "roi_date": record.roi_date,
            "amount_paise": record.amount_paise,
        }
        for record in records
    ]

    return Response(data)
