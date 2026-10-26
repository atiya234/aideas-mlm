from django.urls import path
from .views import HolidayListCreateView, HolidayDeleteView

urlpatterns = [
    path("holidays/", HolidayListCreateView.as_view(), name="holiday-list"),
    path("holidays/<int:pk>/", HolidayDeleteView.as_view(), name="holiday-delete"),
]
