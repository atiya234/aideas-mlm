
from django.urls import path

from .views import (
    RegisterView,
    UserProfileView,
    DirectReferralView,
    ReferralCountView,
    ReferralTreeView,
    AdminNetworkView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "profile/",
        UserProfileView.as_view(),
        name="profile"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "referrals/count/",
        ReferralCountView.as_view(),
        name="referral-count"
    ),

    path(
        "referrals/",
        DirectReferralView.as_view(),
        name="referrals"
    ),

    path(
        "referrals/tree/",
        ReferralTreeView.as_view(),
        name="referral_tree"
    ),

    path(
        "admin/network/",
        AdminNetworkView.as_view(),
        name="admin-network"
    ),
]
