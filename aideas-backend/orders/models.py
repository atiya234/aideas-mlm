from django.db import models
from django.conf import settings
from products.models import Products


class Order(models.Model):

    PAYMENT_STATUS = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    APPROVAL_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )

    product = models.ForeignKey(
        Products,
        on_delete=models.PROTECT,
        blank=True,
        null=True
    )

    amount_paise = models.PositiveIntegerField()

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="pending"
    )

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS,
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True
    )

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"


class orderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Products,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )

    quantity = models.PositiveIntegerField()

    price_paise = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name if self.product else 'Product'} x {self.quantity}"
