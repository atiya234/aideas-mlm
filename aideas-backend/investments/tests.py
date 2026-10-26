
from datetime import date, datetime, time
from decimal import Decimal
from unittest.mock import patch
from io import StringIO

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from investments.models import Investment, DailyROI
from investments.services import process_daily_roi
from orders.models import Order
from products.models import Products
from wallet.models import WalletTransaction
from django.core.management import call_command
from users.models import UserProfile, ReferralLevel
from investments.level_roi_services import credit_level_roi

from django.test import SimpleTestCase
from investments.services import calculate_daily_roi


class InvestmentTest(TestCase):

    # TEST 1: Investment table initially empty
    def test_investment_table_is_empty(self):
        self.assertEqual(Investment.objects.count(), 0)

    # TEST 2: Admin approval creates one investment
    def test_admin_approval_creates_investment(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="testadmin",
            email="testadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="testcustomer",
            password="TestPass123!"
        )

        product = Products.objects.create(
            name="Test Product",
            price_paise=100000,
            roi_percent=Decimal("0.50"),
            roi_duration_working_days=200,
            stock=10
        )

        order = Order.objects.create(
            user=customer,
            product=product,
            amount_paise=100000,
            payment_status="paid",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            f"/api/orders/{order.id}/approve/"
        )

        self.assertEqual(response.status_code, 200)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "approved")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            1
        )

        second_response = client.post(
            f"/api/orders/{order.id}/approve/"
        )

        self.assertEqual(second_response.status_code, 400)

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            1
        )

    # TEST 3: Admin can reject an unpaid order
    def test_admin_can_reject_order(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="rejectadmin",
            email="rejectadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="rejectcustomer",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="pending",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            f"/api/orders/{order.id}/reject/"
        )

        self.assertEqual(response.status_code, 200)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "rejected")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 4: Normal user cannot approve
    def test_normal_user_cannot_approve_order(self):
        User = get_user_model()

        customer = User.objects.create_user(
            username="normaluser",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="pending",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=customer)

        response = client.post(
            f"/api/orders/{order.id}/approve/"
        )

        self.assertEqual(response.status_code, 403)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "pending")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 5: Unpaid order cannot be approved
    def test_unpaid_order_cannot_be_approved(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="unpaidadmin",
            email="unpaidadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="unpaidcustomer",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="pending",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            f"/api/orders/{order.id}/approve/"
        )

        self.assertEqual(response.status_code, 400)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "pending")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 6: Normal user cannot reject
    def test_normal_user_cannot_reject_order(self):
        User = get_user_model()

        customer = User.objects.create_user(
            username="rejectnormaluser",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="pending",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=customer)

        response = client.post(
            f"/api/orders/{order.id}/reject/"
        )

        self.assertEqual(response.status_code, 403)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "pending")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 7: Paid order cannot be directly rejected
    def test_paid_order_cannot_be_rejected(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="paidrejectadmin",
            email="paidrejectadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="paidcustomer",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="paid",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            f"/api/orders/{order.id}/reject/"
        )

        self.assertEqual(response.status_code, 400)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "pending")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 8: Rejected order cannot be approved
    def test_rejected_order_cannot_be_approved(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="rejectedadmin",
            email="rejectedadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="rejectedcustomer",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="paid",
            approval_status="rejected"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            f"/api/orders/{order.id}/approve/"
        )

        self.assertEqual(response.status_code, 400)

        order.refresh_from_db()
        self.assertEqual(order.approval_status, "rejected")

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )

    # TEST 9: Approval rolls back if investment creation fails
    def test_approval_rolls_back_if_investment_creation_fails(self):
        User = get_user_model()

        admin = User.objects.create_superuser(
            username="rollbackadmin",
            email="rollbackadmin@example.com",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="rollbackcustomer",
            password="TestPass123!"
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=100000,
            payment_status="paid",
            approval_status="pending"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        with patch(
            "orders.views.Investment.objects.create",
            side_effect=Exception("Simulated database error")
        ):
            with self.assertRaises(Exception):
                client.post(
                    f"/api/orders/{order.id}/approve/"
                )

        order.refresh_from_db()

        self.assertEqual(order.approval_status, "pending")
        self.assertIsNone(order.approved_at)

        self.assertEqual(
            Investment.objects.filter(order=order).count(),
            0
        )


class DailyROIProcessingTest(TestCase):

    # TEST 10: Credit daily ROI only once per date
    def test_roi_credit_and_prevent_duplicate(self):
        User = get_user_model()

        customer = User.objects.create_user(
            username="roi_customer",
            password="TestPass123!"
        )
        approval_datetime = timezone.make_aware(
        datetime(2026, 10, 26, 10, 0)
        )



        roi_date = date(2026, 10, 27)



        order = Order.objects.create(
            user=customer,
            amount_paise=200000,
            payment_status="paid",
            approval_status="approved",
            approved_at=approval_datetime
        )

        investment = Investment.objects.create(
            user=customer,
            order=order,
            principal_paise=200000,
            roi_percent=Decimal("0.50"),
            roi_duration_working_days=200
        )

        first_result = process_daily_roi(
            investment.id,
            roi_date
        )

        second_result = process_daily_roi(
            investment.id,
            roi_date
        )

        self.assertTrue(first_result)
        self.assertFalse(second_result)

        self.assertEqual(
            DailyROI.objects.filter(
                investment=investment
            ).count(),
            1
        )

        wallet_entries = WalletTransaction.objects.filter(
            user=customer,
            transaction_type="investment_roi"
        )

        self.assertEqual(wallet_entries.count(), 1)

        self.assertEqual(
            wallet_entries.first().amount_paise,
            1000
        )

class ProcessROICommandTest(TestCase):

    def test_process_roi_command(self):
        today = date(2026, 10, 27)
        output = StringIO()

        with patch(
            "investments.management.commands.process_roi.timezone.localdate",
            return_value=today
        ):
            call_command("process_roi", stdout=output)

        self.assertIn(
            "Daily ROI processed for 0 investments.",
            output.getvalue()
        )

class DirectReferralBonusTest(TestCase):

 def test_first_investment_referral_bonus(self):
    User = get_user_model()

    # Create referrer and customer
    ayesha = User.objects.create_user(
        username="ayesha_referrer",
        password="TestPass123!"
    )

    sara = User.objects.create_user(
        username="sara_customer",
        password="TestPass123!"
    )

    # Connect Sara to Ayesha
    ayesha_profile, _ = UserProfile.objects.get_or_create(
        user=ayesha
    )

    sara_profile, _ = UserProfile.objects.get_or_create(
        user=sara
    )

    sara_profile.referred_by = ayesha_profile
    sara_profile.save()

    # Simulated paid order in isolated test database
    order = Order.objects.create(
        user=sara,
        amount_paise=200000,
        payment_status="paid",
        approval_status="pending"
    )

    admin = User.objects.create_superuser(
        username="bonus_admin",
        email="bonusadmin@example.com",
        password="TestPass123!"
    )

    client = APIClient()
    client.force_authenticate(user=admin)

    response = client.post(
        f"/api/orders/{order.id}/approve/"
    )

    self.assertEqual(response.status_code, 200)

    # Check Ayesha received 5% = 100 rupees
    bonus = WalletTransaction.objects.get(
        user=ayesha,
        transaction_type="direct_referral_bonus"
    )

    self.assertEqual(bonus.amount_paise, 10000)

    # Approve a second investment
    second_order = Order.objects.create(
        user=sara,
        amount_paise=300000,
        payment_status="paid",
        approval_status="pending"
    )

    second_response = client.post(
        f"/api/orders/{second_order.id}/approve/"
    )

    self.assertEqual(second_response.status_code, 200)

    # Bonus must still exist only once
    self.assertEqual(
        WalletTransaction.objects.filter(
            user=ayesha,
            transaction_type="direct_referral_bonus"
        ).count(),
        1
    )

class LevelROITest(TestCase):

    def test_level_roi_credit_and_duplicate(self):
        User = get_user_model()

        # Create referrer and customer
        referrer = User.objects.create_user(
            username="level_referrer",
            password="TestPass123!"
        )

        customer = User.objects.create_user(
            username="level_customer",
            password="TestPass123!"
        )

        referrer_profile, _ = UserProfile.objects.get_or_create(
            user=referrer
        )

        customer_profile, _ = UserProfile.objects.get_or_create(
            user=customer
        )

        customer_profile.referred_by = referrer_profile
        customer_profile.save()

        # Example percentage exists only in test database
        ReferralLevel.objects.create(
            level=1,
            percentage=Decimal("5.00"),
            min_direct_referrals=1
        )

        order = Order.objects.create(
            user=customer,
            amount_paise=200000,
            payment_status="paid",
            approval_status="approved"
        )

        investment = Investment.objects.create(
            user=customer,
            order=order,
            principal_paise=200000
        )

        daily_roi = DailyROI.objects.create(
            investment=investment,
            roi_date="2026-10-27",
            amount_paise=1000
        )

        # First credit
        first_result = credit_level_roi(daily_roi.id)

        self.assertEqual(first_result, 1)

        bonus = WalletTransaction.objects.get(
            user=referrer,
            transaction_type="level_roi"
        )

        self.assertEqual(bonus.amount_paise, 50)

        # Second attempt must not credit again
        second_result = credit_level_roi(daily_roi.id)

        self.assertEqual(second_result, 0)

        self.assertEqual(
            WalletTransaction.objects.filter(
                user=referrer,
                transaction_type="level_roi"
            ).count(),
            1
        )

class DailyROICalculationTests(SimpleTestCase):

    def test_daily_roi_calculation(self):
        principal_paise = 1000000  # ₹10,000
        roi_percent = Decimal("0.50")

        result = calculate_daily_roi(
            principal_paise,
            roi_percent
        )

        self.assertEqual(result, 5000)  # ₹50

    def test_daily_roi_rounding(self):
        result = calculate_daily_roi(
            101,
            Decimal("0.50")
        )

        self.assertEqual(result, 0)
