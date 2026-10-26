

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from withdrawals.models import Withdrawal
from withdrawals.services import (
    validate_withdrawal,
    create_withdrawal_request,
)


class WithdrawalValidationTests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="withdrawal_test_user",
            password="TestPassword123!"
        )

    # Test 1: Friday validation
    @patch("withdrawals.services.is_friday_ist", return_value=False)
    def test_withdrawal_not_allowed_on_other_days(self, mock_friday):
        error = validate_withdrawal(self.user, 100)

        self.assertEqual(
            error,
            "Withdrawals are allowed only on Fridays (IST)"
        )

    # Test 2: Minimum withdrawal amount
    def test_withdrawal_below_minimum_amount(self):
        error = validate_withdrawal(self.user, 99)

        self.assertEqual(
            error,
            "Minimum withdrawal amount is ₹1"
        )

    # Test 3: Approved KYC required
    @patch("withdrawals.services.is_friday_ist", return_value=True)
    def test_withdrawal_requires_approved_kyc(self, mock_friday):
        error = validate_withdrawal(self.user, 100)

        self.assertEqual(
            error,
            "KYC approval is required"
        )

    # Test 4: Verified payout account required
    @patch("withdrawals.services.PayoutAccount.objects.filter")
    @patch("withdrawals.services.KYC.objects.filter")
    @patch("withdrawals.services.is_friday_ist", return_value=True)
    def test_withdrawal_requires_verified_payout_account(
        self, mock_friday, mock_kyc_filter, mock_payout_filter
    ):
        mock_kyc_filter.return_value.exists.return_value = True

        mock_payout_filter.return_value.exclude.return_value = (
            mock_payout_filter.return_value
        )
        mock_payout_filter.return_value.exists.return_value = False

        error = validate_withdrawal(self.user, 100)

        self.assertEqual(
            error,
            "A verified payout account is required"
        )

    # Test 5: Insufficient wallet balance
    @patch("withdrawals.services.get_wallet_balance", return_value=50)
    @patch("withdrawals.services.PayoutAccount.objects.filter")
    @patch("withdrawals.services.KYC.objects.filter")
    @patch("withdrawals.services.is_friday_ist", return_value=True)
    def test_withdrawal_insufficient_balance(
        self, mock_friday, mock_kyc_filter, mock_payout_filter, mock_balance
    ):
        mock_kyc_filter.return_value.exists.return_value = True

        mock_payout_filter.return_value.exclude.return_value = (
            mock_payout_filter.return_value
        )
        mock_payout_filter.return_value.exists.return_value = True

        error = validate_withdrawal(self.user, 100)

        self.assertEqual(error, "Insufficient wallet balance")

    # Test 6: Successful withdrawal creation
    @patch("withdrawals.services.get_wallet_balance", return_value=1000)
    @patch("withdrawals.services.PayoutAccount.objects.filter")
    @patch("withdrawals.services.KYC.objects.filter")
    @patch("withdrawals.services.is_friday_ist", return_value=True)
    def test_create_withdrawal_request(
        self, mock_friday, mock_kyc_filter, mock_payout_filter, mock_balance
    ):
        mock_kyc_filter.return_value.exists.return_value = True

        mock_payout_filter.return_value.exclude.return_value = (
            mock_payout_filter.return_value
        )
        mock_payout_filter.return_value.exists.return_value = True

        withdrawal, error = create_withdrawal_request(self.user, 500)

        self.assertIsNone(error)
        self.assertIsNotNone(withdrawal)
        self.assertEqual(withdrawal.amount_paise, 500)
        self.assertEqual(withdrawal.status, "pending")
        self.assertEqual(
            Withdrawal.objects.filter(user=self.user).count(),
            1
        )

    # Test 7: Pending withdrawals reserve available balance
    @patch("withdrawals.services.get_wallet_balance", return_value=1000)
    @patch("withdrawals.services.PayoutAccount.objects.filter")
    @patch("withdrawals.services.KYC.objects.filter")
    @patch("withdrawals.services.is_friday_ist", return_value=True)
    def test_pending_withdrawal_reserves_balance(
        self, mock_friday, mock_kyc_filter, mock_payout_filter, mock_balance
    ):
        mock_kyc_filter.return_value.exists.return_value = True

        mock_payout_filter.return_value.exclude.return_value = (
            mock_payout_filter.return_value
        )
        mock_payout_filter.return_value.exists.return_value = True

        first_withdrawal, first_error = create_withdrawal_request(
            self.user, 700
        )

        self.assertIsNone(first_error)
        self.assertIsNotNone(first_withdrawal)

        second_withdrawal, second_error = create_withdrawal_request(
            self.user, 500
        )

        self.assertIsNone(second_withdrawal)
        self.assertEqual(
            second_error,
            "Insufficient available wallet balance"
        )
        self.assertEqual(
            Withdrawal.objects.filter(user=self.user).count(),
            1
        )
