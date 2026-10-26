from .models import Products
from .serializers import ProductSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser , BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request,view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_authenticated and request.user.is_staff)


@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def product_list(request):


    if request.method == "POST":
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    products = Products.objects.all()
    serializer = ProductSerializer(products, many=True)

    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_product(request , id):
    product = get_object_or_404(Products , id=id)
    serializer = ProductSerializer(product, data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors,status = status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, id):
    product = get_object_or_404(Products, id=id)
    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
