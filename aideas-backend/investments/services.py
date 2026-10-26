
from decimal import Decimal, ROUND_DOWN

from django.db import transaction
from django.utils import timezone

from .models import Investment, Holiday, DailyROI
from wallet.models import WalletTransaction
from .level_roi_services import credit_level_roi


# 1. Calculate daily ROI in paise
def calculate_daily_roi(principal_paise, roi_percent):
    amount = (
        Decimal(principal_paise)
        * Decimal(str(roi_percent))
        / Decimal("100")
    )

    return int(
        amount.to_integral_value(rounding=ROUND_DOWN)
    )


# 2. Check working day and holidays
def is_working_day(check_date):
    if check_date.weekday() >= 5:
        return False

    if Holiday.objects.filter(date=check_date).exists():
        return False

    return True


# 3. Check ROI duration
def can_receive_roi(completed_days, duration_days):
    return completed_days < duration_days


# 4. Count completed ROI days
def get_completed_roi_days(investment):
    return DailyROI.objects.filter(
        investment=investment
    ).count()


# 5. Check investment eligibility
def is_investment_eligible(investment, roi_date):

    if not is_working_day(roi_date):
        return False

    if DailyROI.objects.filter(
        investment=investment,
        roi_date=roi_date
    ).exists():
        return False

    completed_days = get_completed_roi_days(investment)

    if not can_receive_roi(
        completed_days,
        investment.roi_duration_working_days
    ):
        return False

    if investment.order.payment_status != "paid":
        return False

    if investment.order.approval_status != "approved":
        return False

    if not investment.order.approved_at:
        return False

    approval_date = timezone.localtime(
        investment.order.approved_at
    ).date()

    # ROI starts after approval date
    if roi_date <= approval_date:
        return False

    return True


# 6. Process daily ROI and credit wallets
def process_daily_roi(investment_id, roi_date):

    with transaction.atomic():

        investment = (
            Investment.objects
            .select_related("order", "user")
            .select_for_update()
            .get(id=investment_id)
        )

        if not is_investment_eligible(investment, roi_date):
            return False

        roi_amount = calculate_daily_roi(
            investment.principal_paise,
            investment.roi_percent
        )

        if roi_amount <= 0:
            return False

        reference = (
            f"investment_roi_{investment.id}_{roi_date.isoformat()}"
        )

        # Step 1: Create Daily ROI record
        daily_roi = DailyROI.objects.create(
            investment=investment,
            roi_date=roi_date,
            amount_paise=roi_amount
        )

        # Step 2: Credit investment owner's wallet
        WalletTransaction.objects.create(
            user=investment.user,
            transaction_type="investment_roi",
            amount_paise=roi_amount,
            reference=reference
        )

        # Step 3: Credit eligible ancestors
        credit_level_roi(daily_roi.id)

        return True
