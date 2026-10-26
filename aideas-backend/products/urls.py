from django.urls import path
from .views import product_list , update_product , delete_product

urlpatterns = [
    path("products/", product_list, name = "product-list"),
    path("products/<int:id>/", update_product,  name="update-product"),
    path("products/delete/<int:id>/", delete_product, name="delete-product")
]
