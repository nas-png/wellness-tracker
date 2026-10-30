"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from django.contrib import admin
from django.urls import path
from tracking.views import *
from tracking import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/login/', login),
    path('api/register/', register),
    # Profile
    path('api/profile/', profile),
    # Goals
    path('api/goals/', goals),
    # Assessment
    path('api/assessment/', assessment),
    # Metrics
    path('api/log/', log_health),
    path('api/today/', get_today_metrics),
    path('api/history/', get_history),
    # Recommendations
    path('api/recommendations/', get_recommendations),
    # Stats
    path('api/stats/', stats_summary),

    
]
