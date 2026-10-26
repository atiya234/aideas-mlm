from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)#  receiver connect our function to receiver
def create_user_profile(sender , instance , created, **kwargs):
    if created:
        # get_or_create() create profile only if one doesn't already exist
        UserProfile.objects.get_or_create(user=instance)
