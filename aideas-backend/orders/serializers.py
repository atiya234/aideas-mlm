from rest_framework import serializers
from .models import Order , orderItem



class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)# sourse...get product name through forignKey
    class Meta:
        model = orderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price_paise"
        ]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = '__all__'
