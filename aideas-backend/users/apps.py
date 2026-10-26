from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auuto_field = 'django.db.models.BigAutoField'
    name = 'users'


    def ready(self):
        import users.signals
