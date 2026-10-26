
from datetime import date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .services import get_monthly_bonus_preview


@api_view(["GET"])

@permission_classes([IsAdminUser])
def monthly_bonus_preview(request):
    month_str = request.query_params.get("month")

    if not month_str:
        return Response(
            {"error": "Month is required. Use YYYY-MM."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        month = date.fromisoformat(f"{month_str}-01")
    except ValueError:
        return Response(
            {"error": "Invalid month. Use YYYY-MM."},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = get_monthly_bonus_preview(month)

    return Response(data)
