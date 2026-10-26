
from django.contrib.auth import get_user_model

from rest_framework import generics
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
)
from rest_framework.response import Response

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    DirectReferralSerializer,
)

User = get_user_model()


# Register User
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# Logged-in User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# Direct Referrals
class DirectReferralView(generics.ListAPIView):
    serializer_class = DirectReferralSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.direct_referrals.all()


# Direct Referral Count
class ReferralCountView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = request.user.direct_referrals.count()

        return Response({
            "total_direct_referrals": count
        })


# Recursive Referral Tree Function
def get_referral_tree(user, level=1):
    if level > 7:
        return []

    referrals = []

    children = user.direct_referrals.all()

    for child in children:
        referrals.append({
            "id": child.id,
            "username": child.username,
            "level": level,
            "children": get_referral_tree(child, level + 1)
        })

    return referrals


# User Referral Tree API
class ReferralTreeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tree = get_referral_tree(request.user)

        return Response({
            "referral_tree": tree
        })


# Admin Network API
class AdminNetworkView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.select_related(
            "referred_by"
        ).all().order_by("id")

        members = []

        for user in users:
            members.append({
                "id": user.id,
                "name": user.username,
                "code": user.referral_code,
                "referredBy": (
                    user.referred_by.username
                    if user.referred_by
                    else "-"
                ),
                "parent_id": user.referred_by_id,
                "status": (
                    "Active"
                    if user.is_active
                    else "Inactive"
                ),
            })

        return Response({
            "total_members": len(members),
            "members": members,
        })
