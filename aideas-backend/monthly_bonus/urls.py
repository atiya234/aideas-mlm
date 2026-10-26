
from django.urls import path
from . import views

urlpatterns = [
    path(
        "preview/",
        views.monthly_bonus_preview,
        name="monthly_bonus_preview"
    ),
]
