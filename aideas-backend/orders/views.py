import logging

logger = logging.getLogger(__name__)


import razorpay

from decimal import Decimal, ROUND_DOWN

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Order, orderItem
from .serializers import OrderSerializer

from products.models import Products
from investments.models import Investment
from users.models import UserProfile
from wallet.models import WalletTransaction
from audit.models import AuditLog


# ---------------------------------------
# 1. CREATE DJANGO ORDER
# ---------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):

    items = request.data.get("items", [])

    if not isinstance(items, list) or not items:
        return Response(
            {"message": "Cart is empty or invalid"},
            status=status.HTTP_400_BAD_REQUEST
        )

    total_amount = 0
    validated_items = []
    seen_product_ids = set()

    for item in items:

        if not isinstance(item, dict):
            return Response(
                {"message": "Invalid cart item"},
                status=status.HTTP_400_BAD_REQUEST
            )

        product_id = item.get("product_id")
        quantity = item.get("quantity")

        if type(product_id) is not int or product_id <= 0:
            return Response(
                {"message": "Invalid product ID"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if type(quantity) is not int or quantity <= 0:
            return Response(
                {"message": "Invalid quantity"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if product_id in seen_product_ids:
            return Response(
                {"message": "Duplicate product in cart"},
                status=status.HTTP_400_BAD_REQUEST
            )

        seen_product_ids.add(product_id)

        product = get_object_or_404(
            Products,
            id=product_id
        )

        if quantity > product.stock:
            return Response(
                {"message": f"Insufficient stock for {product.name}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_item = quantity * product.price_paise
        total_amount += total_item

        validated_items.append({
            "product": product,
            "quantity": quantity,
            "price_paise": product.price_paise
        })

    if total_amount <= 0:
        return Response(
            {"message": "Order amount must be greater than zero"},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():

        order = Order.objects.create(
            user=request.user,
            amount_paise=total_amount,
            payment_status="pending",
            approval_status="pending"
        )

        for item in validated_items:

            orderItem.objects.create(
                order=order,
                product=item["product"],
                quantity=item["quantity"],
                price_paise=item["price_paise"]
            )

    return Response(
        {
            "message": "Order created, payment pending",
            "order_id": order.id,
            "total_amount_paise": total_amount
        },
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------
# 2. GET LOGGED-IN USER ORDERS
# ---------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):

    orders = Order.objects.filter(
        user=request.user
    ).order_by("-created_at")

    serializer = OrderSerializer(
        orders,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------------------------------------
# 3. ADMIN APPROVES ORDER
# ---------------------------------------

@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_order(request, id):

    with transaction.atomic():

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=id
        )

        if order.payment_status != "paid":
            return Response(
                {"error": "Payment is not completed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.approval_status != "pending":
            return Response(
                {"error": "Order already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        User = get_user_model()

        User.objects.select_for_update().get(
            pk=order.user_id
        )

        is_first_investment = not Investment.objects.filter(
            user=order.user
        ).exists()

        order.approval_status = "approved"
        order.approved_at = timezone.now()

        order.save(
            update_fields=[
                "approval_status",
                "approved_at"
            ]
        )

        Investment.objects.create(
            user=order.user,
            order=order,
            principal_paise=order.amount_paise
        )

        # First approved investment gets 5% referral bonus
        if is_first_investment:

            profile = UserProfile.objects.filter(
                user=order.user
            ).select_related(
                "referred_by__user"
            ).first()

            if profile and profile.referred_by:

                referrer = profile.referred_by.user

                bonus_paise = int(
                    (
                        Decimal(order.amount_paise)
                        * Decimal("0.05")
                    ).to_integral_value(
                        rounding=ROUND_DOWN
                    )
                )

                if bonus_paise > 0:

                    WalletTransaction.objects.create(
                        user=referrer,
                        transaction_type="direct_referral_bonus",
                        amount_paise=bonus_paise,
                        reference=f"direct_referral_bonus_{order.user_id}"
                    )

        # Audit log after successful approval
        AuditLog.objects.create(
            actor=request.user,
            action="ORDER_APPROVED",
            target_type="Order",
            target_id=str(order.id),
            details={
                "previous_status": "pending",
                "new_status": "approved",
                "user_id": order.user_id,
                "amount_paise": order.amount_paise
            }
        )

    return Response(
        {
            "message": "Order approved and investment created successfully"
        },
        status=status.HTTP_200_OK
    )


# ---------------------------------------
# 4. ADMIN GETS ALL ORDERS
# ---------------------------------------

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_orders(request):

    orders = Order.objects.all().order_by(
        "-created_at"
    )

    serializer = OrderSerializer(
        orders,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------------------------------------
# 5. ADMIN REJECTS ORDER
# ---------------------------------------

@api_view(["POST"])
@permission_classes([IsAdminUser])
def reject_order(request, id):

    with transaction.atomic():

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=id
        )

        if order.approval_status != "pending":
            return Response(
                {"error": "Order already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.payment_status == "paid":
            return Response(
                {
                    "error": "Paid orders require a refund workflow before rejection"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.approval_status = "rejected"

        order.save(
            update_fields=["approval_status"]
        )

        AuditLog.objects.create(
            actor=request.user,
            action="ORDER_REJECTED",
            target_type="Order",
            target_id=str(order.id),
            details={
                "previous_status": "pending",
                "new_status": "rejected",
                "user_id": order.user_id,
                "amount_paise": order.amount_paise
            }
        )

    return Response(
        {"message": "Order rejected successfully"},
        status=status.HTTP_200_OK
    )


# ---------------------------------------
# 6. CREATE RAZORPAY PAYMENT ORDER
# ---------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):

    order_id = request.data.get("order_id")

    if not order_id:
        return Response(
            {"error": "Order ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return Response(
            {"error": "Razorpay credentials are not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    with transaction.atomic():
        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user
        )

        if order.payment_status == "paid":
            return Response(
                {"error": "Order already paid"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.approval_status != "pending":
            return Response(
                {"error": "Order is already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.razorpay_order_id:
            return Response(
                {
                    "order_id": order.id,
                    "razorpay_order_id": order.razorpay_order_id,
                    "amount": order.amount_paise,
                    "currency": "INR",
                    "key": settings.RAZORPAY_KEY_ID
                },
                status=status.HTTP_200_OK
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        try:
            razorpay_order = client.order.create(
                data={
                    "amount": order.amount_paise,
                    "currency": "INR",
                    "receipt": f"order_{order.id}"
                }
            )

        except razorpay.errors.BadRequestError:
            logger.exception("Razorpay order creation failed")

            return Response(
              {"error": "Razorpay rejected the payment request"},
              status=400
    )
        except razorpay.errors.AuthenticationError:
            return Response(
                {"error": "Razorpay authentication failed. Check test API keys."},
                status=status.HTTP_502_BAD_GATEWAY
            )

        except razorpay.errors.RazorpayError:
            return Response(
                {"error": "Unable to create Razorpay order"},
                status=status.HTTP_502_BAD_GATEWAY
            )

        order.razorpay_order_id = razorpay_order["id"]
        order.save(update_fields=["razorpay_order_id"])

    return Response(
        {
            "order_id": order.id,
            "razorpay_order_id": order.razorpay_order_id,
            "amount": order.amount_paise,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID
        },
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------
# 7. VERIFY RAZORPAY PAYMENT
# ---------------------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):

    order_id = request.data.get("order_id")
    razorpay_order_id = request.data.get("razorpay_order_id")
    razorpay_payment_id = request.data.get("razorpay_payment_id")
    razorpay_signature = request.data.get("razorpay_signature")

    if not all([
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    ]):
        return Response(
            {"error": "Missing payment details"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return Response(
            {"error": "Payment service is not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        )
    )

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })

    except razorpay.errors.SignatureVerificationError:
        return Response(
            {"error": "Invalid payment signature"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        payment = client.payment.fetch(
            razorpay_payment_id
        )

    except razorpay.errors.RazorpayError:
        return Response(
            {"error": "Unable to fetch payment details"},
            status=status.HTTP_502_BAD_GATEWAY
        )

    with transaction.atomic():

        order = get_object_or_404(
            Order.objects.select_for_update(),
            id=order_id,
            user=request.user
        )

        if order.razorpay_order_id != razorpay_order_id:
            return Response(
                {"error": "Razorpay order mismatch"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            payment.get("order_id") != razorpay_order_id
            or payment.get("amount") != order.amount_paise
            or payment.get("currency") != "INR"
            or payment.get("status") != "captured"
        ):
            return Response(
                {"error": "Payment is not captured or details do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.payment_status == "paid":
            return Response(
                {
                    "message": "Payment already verified",
                    "order_id": order.id,
                    "payment_status": "paid"
                },
                status=status.HTTP_200_OK
            )

        if order.approval_status != "pending":
            return Response(
                {"error": "Order is already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.payment_status = "paid"
        order.save(update_fields=["payment_status"])

        AuditLog.objects.create(
            actor=request.user,
            action="PAYMENT_VERIFIED",
            target_type="Order",
            target_id=str(order.id),
            details={
                "payment_status": "paid",
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "amount_paise": order.amount_paise
            }
        )

    return Response(
        {
            "message": "Payment verified successfully",
            "order_id": order.id,
            "payment_status": "paid"
        },
        status=status.HTTP_200_OK
    )
