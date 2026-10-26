


from datetime import date, timedelta
from decimal import Decimal, ROUND_DOWN

from django.db.models import Sum
from django.utils import timezone

from .models import RevenueTransaction, SubtreeRevenue

from django.db import transaction, IntegrityError

from wallet.models import WalletTransaction
from .models import MonthlyBonus


QUALIFICATION_THRESHOLD_PAISE = 1_000_000_000
BONUS_PERCENTAGE = Decimal("1.00")


def get_previous_month(today=None):
    if today is None:
        today = timezone.localdate()

    first_day = today.replace(day=1)
    last_day = first_day - timedelta(days=1)

    return last_day.replace(day=1)


def get_month_range(month):
    start = month.replace(day=1)

    if start.month == 12:
        end = date(start.year + 1, 1, 1)
    else:
        end = date(start.year, start.month + 1, 1)

    return start, end


def get_company_monthly_revenue(month):
    start, end = get_month_range(month)

    result = RevenueTransaction.objects.filter(
        created_at__date__gte=start,
        created_at__date__lt=end,
        order__payment_status="paid",
    ).aggregate(total=Sum("amount_paise"))

    return result["total"] or 0


def calculate_monthly_bonus(company_revenue_paise):
    if company_revenue_paise <= 0:
        return 0

    amount = (
        Decimal(company_revenue_paise)
        * BONUS_PERCENTAGE
        / Decimal("100")
    )

    return int(
        amount.to_integral_value(rounding=ROUND_DOWN)
    )


def get_monthly_bonus_preview(month):
    company_revenue = get_company_monthly_revenue(month)

    bonus_per_user = calculate_monthly_bonus(company_revenue)

    eligible_users = SubtreeRevenue.objects.filter(
        month=month.replace(day=1),
        amount_paise__gte=QUALIFICATION_THRESHOLD_PAISE,
    ).select_related("user")

    qualifiers = [
        {
            "user_id": record.user_id,
            "username": record.user.username,
            "subtree_revenue_paise": record.amount_paise,
            "bonus_paise": bonus_per_user,
        }
        for record in eligible_users
    ] if company_revenue > 0 else []

    return {
        "month": month.isoformat(),
        "company_revenue_paise": company_revenue,
        "bonus_per_qualifier_paise": bonus_per_user,
        "qualifiers": qualifiers,
    }


def distribute_monthly_bonus(month):
    month = month.replace(day=1)

    company_revenue = get_company_monthly_revenue(month)
    bonus_per_user = calculate_monthly_bonus(company_revenue)

    if bonus_per_user <= 0:
        return 0

    eligible_users = SubtreeRevenue.objects.filter(
        month=month,
        amount_paise__gte=QUALIFICATION_THRESHOLD_PAISE
    )

    credited_count = 0

    for record in eligible_users:
        reference = f"{month.strftime('%Y-%m')}_{record.user_id}"

        try:
            with transaction.atomic():
                bonus, created = MonthlyBonus.objects.get_or_create(
                    user_id=record.user_id,
                    month=month,
                    defaults={"amount_paise": bonus_per_user}
                )

                if not created:
                    continue

                WalletTransaction.objects.create(
                    user_id=record.user_id,
                    transaction_type="revenue_share",
                    amount_paise=bonus_per_user,
                    reference=reference
                )

                credited_count += 1

        except IntegrityError:
            # Duplicate bonus or wallet reference.
            # The transaction is rolled back.
            continue

    return credited_count
