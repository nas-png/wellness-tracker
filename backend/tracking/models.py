from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)  # kg
    height = models.FloatField(null=True, blank=True)  # cm
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    fitness_level = models.CharField(max_length=20, default='beginner')  # beginner, intermediate, advanced
    fitness_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    daily_steps = models.IntegerField(default=10000)
    daily_water = models.FloatField(default=2.0)  # liters
    daily_sleep = models.FloatField(default=8.0)  # hours
    daily_calories = models.IntegerField(default=2000)
    created_at = models.DateTimeField(auto_now_add=True)

class FitnessAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    pushups = models.IntegerField(default=0)
    running_time = models.FloatField(default=0)  # minutes
    flexibility_score = models.IntegerField(default=0)  # 1-10
    fitness_score = models.IntegerField(default=0)
    level = models.CharField(max_length=20, default='beginner')

class HealthMetric(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    steps = models.IntegerField(default=0)
    water_liters = models.FloatField(default=0)
    sleep_hours = models.FloatField(default=0)
    calories = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)  
    difficulty = models.CharField(max_length=20)  
    created_at = models.DateTimeField(auto_now_add=True)