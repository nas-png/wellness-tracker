import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

email = os.environ.get('ADMIN_EMAIL')
password = os.environ.get('ADMIN_PASSWORD')

if email and password and not User.objects.filter(username=email).exists():
    User.objects.create_superuser(username=email, email=email, password=password)
    print('Admin created')
else:
    print('Admin skipped')