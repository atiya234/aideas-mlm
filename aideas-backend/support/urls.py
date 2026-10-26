
from django.urls import path

from .views import (
    SupportTicketListCreateView,
    AdminSupportTicketListView,
    AdminSupportTicketUpdateView,
)

urlpatterns = [
    # User endpoints
    path(
        "tickets/",
        SupportTicketListCreateView.as_view(),
        name="support-tickets",
    ),

    # Admin endpoints
    path(
        "admin/tickets/",
        AdminSupportTicketListView.as_view(),
        name="admin-support-tickets",
    ),

    path(
        "admin/tickets/<int:pk>/",
        AdminSupportTicketUpdateView.as_view(),
        name="admin-support-ticket-update",
    ),
]
