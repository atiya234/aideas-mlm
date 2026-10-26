
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import SupportTicket
from .serializers import SupportTicketSerializer

from notifications.models import Notification


# USER: View own tickets and create new tickets
class SupportTicketListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SupportTicket.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ADMIN: View all users' support tickets
class AdminSupportTicketListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        return SupportTicket.objects.select_related(
            "user"
        ).order_by("-created_at")


# ADMIN: Update ticket status
class AdminSupportTicketUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SupportTicketSerializer
    queryset = SupportTicket.objects.all()
    http_method_names = ["patch"]

    def patch(self, request, *args, **kwargs):
        ticket = self.get_object()

        new_status = request.data.get("status")

        allowed_statuses = [
            "open",
            "in_progress",
            "resolved",
            "closed",
        ]

        if new_status not in allowed_statuses:
            return Response(
                {
                    "error": "Invalid ticket status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])

        return Response({
            "message": "Ticket status updated successfully.",
            "id": ticket.id,
            "status": ticket.status,
        })



class AdminSupportTicketUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = SupportTicketSerializer
    queryset = SupportTicket.objects.all()
    http_method_names = ["patch"]

    def patch(self, request, *args, **kwargs):
        ticket = self.get_object()

        new_status = request.data.get("status")

        allowed_statuses = [
            "open",
            "in_progress",
            "resolved",
            "closed",
        ]

        if new_status not in allowed_statuses:
            return Response(
                {"error": "Invalid ticket status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = ticket.status

        if old_status == new_status:
            return Response({
                "message": "Ticket status is already up to date.",
                "id": ticket.id,
                "status": ticket.status,
            })

        ticket.status = new_status
        ticket.save(update_fields=["status", "updated_at"])

        Notification.objects.create(
            user=ticket.user,
            title="Support Ticket Updated",
            message=(
                f'Your support ticket "{ticket.subject}" '
                f'has been updated to {new_status.replace("_", " ")}.'
            ),
        )

        return Response({
            "message": "Ticket status updated successfully.",
            "id": ticket.id,
            "status": ticket.status,
        })
