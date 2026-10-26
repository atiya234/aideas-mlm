from django.db import models

class Products(models.Model):
    name = models.CharField(max_length=200)
    price_paise = models.PositiveIntegerField()
    roi_percent = models.DecimalField(max_digits=5, decimal_places=2)
    roi_duration_working_days = models.PositiveIntegerField(default=200)

    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True)
    stock = models.PositiveIntegerField(default=0)

    # Automatically save date and time when product is created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
