from django.urls import path
from .views import WalletBalanceView, WalletTransactionsView
from .views import AdminWalletTransactionsView

urlpatterns = [
    path("balance/", WalletBalanceView.as_view(), name="wallet-balance"),
    path("transactions/", WalletTransactionsView.as_view(), name= "wallet-transaction"),
    path(
    "admin/transactions/",
    AdminWalletTransactionsView.as_view(),
    name="admin_wallet_transactions"
),
]
