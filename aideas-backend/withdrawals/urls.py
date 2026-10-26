
from django.urls import path
from .views import MyWithdrawalsView, AdminWithdrawalsView

urlpatterns = [
    path(
        "my/",
        MyWithdrawalsView.as_view(),
        name="my_withdrawals"
    ),
    path(
        "admin/",
        AdminWithdrawalsView.as_view(),
        name="admin_withdrawals"
    ),
]
