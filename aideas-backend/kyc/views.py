
from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes,
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import KYC
from .serializers import KYCSerializer
from django.shortcuts import get_object_or_404

from django.http import FileResponse, Http404
from django.utils._os import safe_join
from pathlib import Path



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_kyc(request):

    # Check whether the user already submitted KYC
    if KYC.objects.filter(user=request.user).exists():
        return Response(
            {"error": "KYC already submitted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = KYCSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                kyc = serializer.save(user=request.user)
        except IntegrityError:
            return Response(
                {"error": "KYC already submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "KYC submitted successfully.",
                "id": kyc.id,
                "status": kyc.status
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kyc_status(request):
    try:
        kyc = KYC.objects.get(user=request.user)
    except KYC.DoesNotExist:
        return Response({
            "status": "not_submitted",
            "message": "KYC not submitted yet."
        })
    return Response({
        "id":kyc.id,
        "status": kyc.status,
        "rejection_reason": kyc.rejection_reason,
        "submitted_at": kyc.submitted_at,
        "reviewed_at": kyc.reviewed_at,
    })



@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def review_kyc(request, id):
    decision = request.data.get("status")
    reason = request.data.get("rejection_reason", "")

    if decision not in ["approved", "rejected"]:
        return Response(
            {"error": "Status must be approved or rejected."},
            status=400
        )

    if decision == "rejected" and not str(reason).strip():
        return Response(
            {"error": "Rejection reason is required."},
            status=400
        )

    with transaction.atomic():
        kyc = get_object_or_404(
            KYC.objects.select_for_update(),
            id=id
        )

        if kyc.status != "pending":
            return Response(
                {"error": "This KYC has already been reviewed."},
                status=400
            )

        kyc.status = decision
        kyc.rejection_reason = (
            str(reason).strip() if decision == "rejected" else ""
        )
        kyc.reviewed_at = timezone.now()

        kyc.save(
            update_fields=[
                "status",
                "rejection_reason",
                "reviewed_at"
            ]
        )

    return Response({
        "message": f"KYC {decision} successfully.",
        "id": kyc.id,
        "status": kyc.status
    })



@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_kyc_list(request):
    records = KYC.objects.select_related("user").order_by("-submitted_at")

    data = [
        {
            "id": kyc.id,
            "username": kyc.user.username,
            "status": kyc.status,
            "submitted_at": kyc.submitted_at,
            "reviewed_at": kyc.reviewed_at,
        }
        for kyc in records
    ]

    return Response(data)



@api_view(["GET"])
@permission_classes([IsAdminUser])
def view_kyc_document(request, id):
    kyc = get_object_or_404(KYC, id=id)

    if not kyc.document:
        return Response(
            {"error": "No document uploaded."},
            status=404
        )

    try:
        file = kyc.document.open("rb")
    except (FileNotFoundError, OSError):
        raise Http404("Document not found.")

    filename = Path(kyc.document.name).name

    return FileResponse(
        file,
        as_attachment=False,
        filename=filename,
        content_type=(
            "application/pdf"
            if filename.lower().endswith(".pdf")
            else "image/jpeg"
            if filename.lower().endswith((".jpg", ".jpeg"))
            else "image/png"
        ),
        headers={"Cache-Control": "no-store"},
    )
