
from django.urls import path
from . import views
from .views import admin_investments, admin_daily_roi_history

urlpatterns = [
    path("my/", views.my_investments, name="my-investments"),
    path("roi/history/", views.my_daily_roi_history, name="my-roi-history"),
    path("level-roi/history/", views.my_level_roi_history, name="my-level-roi-history"),
    path("admin/", admin_investments, name="admin_investments"),
    path(
    "admin/daily-roi/",
    admin_daily_roi_history,
    name="admin_daily_roi_history"
),
]
