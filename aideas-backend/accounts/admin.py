from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin

# Register your models here.
#
class CustomerUserAdmin(UserAdmin):
    list_display = (
        'username',
        'email',
        'role',
        'referral_code',
        'referred_by',
        'is_staff',
    )
admin.site.register(User , CustomerUserAdmin)
