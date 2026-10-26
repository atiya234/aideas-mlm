from django.urls import path
from .views import create_order, my_orders , approve_order, admin_orders, reject_order , create_razorpay_order
urlpatterns = [
    path('orders/create/', create_order, name = "create_order"),
    path('orders/my/', my_orders , name = "my_orders"),
    path("orders/<int:id>/approve/", approve_order, name = "approve_order"),
    path("orders/admin/",admin_orders, name="admin_orders"),
    path("orders/<int:id>/reject/", reject_order, name="reject_order"),
    path(
    "orders/razorpay/create/",
    create_razorpay_order,
    name="create_razorpay_order"
),
]
