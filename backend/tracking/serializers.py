from rest_framework import serializers
from django.contrib.auth.models import User
from .models import HealthMetric, Goal, UserProfile, FitnessAssessment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class HealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthMetric
        fields = '__all__'

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class FitnessAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FitnessAssessment
        fields = '__all__'