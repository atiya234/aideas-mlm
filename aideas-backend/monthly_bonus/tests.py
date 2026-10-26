from django.test import TestCase

# Create your tests here.

from datetime import date


from .services import (
    calculate_monthly_bonus,
    get_previous_month,
    get_month_range,
    QUALIFICATION_THRESHOLD_PAISE,
)


from unittest.mock import patch

from django.contrib.auth import get_user_model
from wallet.models import WalletTransaction

from .models import SubtreeRevenue, MonthlyBonus
from .services import distribute_monthly_bonus

class MonthlyBonusCalculationTest(TestCase):

    def test_one_percent_of_four_crore(self):
        company_revenue_paise = 4_000_000_000

        self.assertEqual(
            calculate_monthly_bonus(company_revenue_paise),
            40_000_000
        )

    def test_zero_revenue(self):
        self.assertEqual(
            calculate_monthly_bonus(0),
            0
        )

    def test_previous_month(self):
        self.assertEqual(
            get_previous_month(date(2026, 10, 22)),
            date(2026, 9, 1)
        )

    def test_month_range(self):
        self.assertEqual(
            get_month_range(date(2026, 9, 1)),
            (date(2026, 9, 1), date(2026, 10, 1))
        )

    def test_one_crore_threshold(self):
        self.assertEqual(
            QUALIFICATION_THRESHOLD_PAISE,
            1_000_000_000
        )

class MonthlyBonusDistributionTest(TestCase):

    def test_bonus_credit_and_no_duplicate(self):
        User = get_user_model()

        user = User.objects.create_user(
            username="bonus_test_user",
            password="TestPass123!"
        )

        month = date(2026, 9, 1)

        SubtreeRevenue.objects.create(
            user=user,
            month=month,
            amount_paise=1_000_000_000
        )

        # Mock company revenue: ₹4 crore
        with patch(
            "monthly_bonus.services.get_company_monthly_revenue",
            return_value=40_000_000_000
        ):
            first_run = distribute_monthly_bonus(month)
            second_run = distribute_monthly_bonus(month)

        self.assertEqual(first_run, 1)
        self.assertEqual(second_run, 0)

        self.assertEqual(
            MonthlyBonus.objects.filter(
                user=user,
                month=month
            ).count(),
            1
        )

        wallet_transaction = WalletTransaction.objects.get(
            reference=f"2026-09_{user.id}"
        )

        self.assertEqual(
            wallet_transaction.transaction_type,
            "revenue_share"
        )

        # 1% of ₹4 crore = ₹4 lakh
        self.assertEqual(
            wallet_transaction.amount_paise,
            400_000_000
        )
