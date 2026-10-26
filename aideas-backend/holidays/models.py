from django.db import models

# Create your models here.
class Holiday(models.Model):
    name = models.CharField(max_length=100)
    date = models.CharField(unique=True)

def __str__(self):

    return f"{self.name} - {self.date}"
