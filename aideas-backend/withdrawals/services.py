
from datetime import datetime
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum, BigIntegerField, Value
from django.db.models.functions import Coalesce

from kyc.models import KYC
from wallet.models import WalletTransaction
from .models import PayoutAccount, Withdrawal


def is_friday_ist():
    today = datetime.now(ZoneInfo("Asia/Kolkata"))
    return today.weekday() == 4


def get_wallet_balance(user):
    result = WalletTransaction.objects.filter(
        user=user
    ).aggregate(
        balance=Coalesce(
            Sum("amount_paise"),
            Value(0),
            output_field=BigIntegerField()
        )
    )

    return result["balance"]


def validate_withdrawal(user, amount_paise):
    if not isinstance(amount_paise, int) or isinstance(amount_paise, bool):
        return "Invalid withdrawal amount"

    if amount_paise < 100:
        return "Minimum withdrawal amount is ₹1"

    if not is_friday_ist():
        return "Withdrawals are allowed only on Fridays (IST)"

    if not KYC.objects.filter(
        user=user,
        status="approved"
    ).exists():
        return "KYC approval is required"

    if not PayoutAccount.objects.filter(
        user=user,
        is_verified=True
    ).exclude(
        razorpay_fund_account_id=""
    ).exclude(
        razorpay_fund_account_id__isnull=True
    ).exists():
        return "A verified payout account is required"

    balance = get_wallet_balance(user)

    if balance < amount_paise:
        return "Insufficient wallet balance"

    return None


def create_withdrawal_request(user, amount_paise):
    User = get_user_model()

    with transaction.atomic():

        # Lock the user row to serialize withdrawal creation
        locked_user = User.objects.select_for_update().get(
            pk=user.pk
        )

        # Validate withdrawal requirements
        error = validate_withdrawal(
            locked_user,
            amount_paise
        )

        if error:
            return None, error

        # Reserve amounts for pending and processing withdrawals
        reserved_amount = (
            Withdrawal.objects.filter(
                user=locked_user,
                status__in=["pending", "processing"]
            ).aggregate(
                total=Sum("amount_paise")
            )["total"] or 0
        )

        # Wallet balance minus existing reservations
        available_balance = (
            get_wallet_balance(locked_user) - reserved_amount
        )

        if available_balance < amount_paise:
            return None, "Insufficient available wallet balance"

        # Create withdrawal request
        withdrawal = Withdrawal.objects.create(
            user=locked_user,
            amount_paise=amount_paise,
            status="pending"
        )

        return withdrawal, None
