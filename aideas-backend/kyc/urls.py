from django.urls import path
from .views import submit_kyc, kyc_status, review_kyc, admin_kyc_list, view_kyc_document

urlpatterns = [
    path("submit/", submit_kyc, name="submit_kyc"),
    path("status/", kyc_status, name="kyc_status"),
     path("admin/<int:id>/review/", review_kyc, name="review_kyc"),
      path("admin/list/", admin_kyc_list, name="admin_kyc_list"),
      path("admin/<int:id>/document/", view_kyc_document, name="view_kyc_document")
]
