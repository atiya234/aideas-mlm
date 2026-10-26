from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .models import Holiday
from .serializers import HolidaySerializer

# Create your views here.

class HolidayListCreateView(generics.ListCreateAPIView):

    queryset = Holiday.objects.all().order_by("date")
    serializer_class = HolidaySerializer
    permission_classes = [IsAdminUser]

class HolidayDeleteView(generics.DestroyAPIView):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [IsAdminUser]
