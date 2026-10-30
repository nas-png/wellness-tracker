from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from .models import HealthMetric, Goal, FitnessAssessment, UserProfile, Recommendation
from .serializers import *
from anthropic import Anthropic

# AUTH ENDPOINTS
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        user = authenticate(username=user.username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'fitness_score': profile.fitness_score if profile else 0,
            })
    except User.DoesNotExist:
        pass
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    UserProfile.objects.create(user=user)
    Goal.objects.create(user=user)
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
    }, status=status.HTTP_201_CREATED)

# PROFILE
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)
    
    if request.method == 'GET':
        return Response({
            'username': user.username,
            'email': user.email,
            'age': profile.age,
            'weight': profile.weight,
            'height': profile.height,
            'gender': profile.gender,
            'fitness_level': profile.fitness_level,
            'fitness_score': profile.fitness_score,
        })
    
    if request.method == 'PUT':
        profile.age = request.data.get('age', profile.age)
        profile.weight = request.data.get('weight', profile.weight)
        profile.height = request.data.get('height', profile.height)
        profile.gender = request.data.get('gender', profile.gender)
        profile.save()
        
        return Response({'message': 'Profile updated'})

# GOALS
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def goals(request):
    user = request.user
    goal, _ = Goal.objects.get_or_create(user=user)
    
    if request.method == 'GET':
        return Response({
            'daily_steps': goal.daily_steps,
            'daily_water': goal.daily_water,
            'daily_sleep': goal.daily_sleep,
            'daily_calories': goal.daily_calories,
        })
    
    if request.method == 'PUT':
        goal.daily_steps = request.data.get('daily_steps', goal.daily_steps)
        goal.daily_water = request.data.get('daily_water', goal.daily_water)
        goal.daily_sleep = request.data.get('daily_sleep', goal.daily_sleep)
        goal.daily_calories = request.data.get('daily_calories', goal.daily_calories)
        goal.save()
        
        return Response({'message': 'Goals updated'})

# FITNESS ASSESSMENT QUIZ
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assessment(request):
    user = request.user
    profile = UserProfile.objects.get(user=user)
    
    pushups = request.data.get('pushups', 0)
    running_time = request.data.get('running_time', 0)
    flexibility = request.data.get('flexibility', 0)
    
    # Calculate fitness score
    pushup_score = min(pushups * 2, 40)
    running_score = min(running_time * 1.5, 30)
    flexibility_score = flexibility * 3
    
    fitness_score = pushup_score + running_score + flexibility_score
    
    if fitness_score < 30:
        level = 'beginner'
    elif fitness_score < 60:
        level = 'intermediate'
    else:
        level = 'advanced'
    
    assessment = FitnessAssessment.objects.create(
        user=user,
        pushups=pushups,
        running_time=running_time,
        flexibility_score=flexibility,
        fitness_score=fitness_score,
        level=level,
    )
    
    profile.fitness_score = fitness_score
    profile.fitness_level = level
    profile.save()
    
    return Response({
        'fitness_score': fitness_score,
        'level': level,
        'message': f'Great! Your fitness level is {level}',
    })

# LOG HEALTH DATA
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_health(request):
    user = request.user
    
    steps = request.data.get('steps', 0)
    water = request.data.get('water_liters', 0)
    sleep = request.data.get('sleep_hours', 0)
    calories = request.data.get('calories', 0)
    
    today = datetime.now().date()
    
    metric, created = HealthMetric.objects.update_or_create(
        user=user,
        date=today,
        defaults={
            'steps': steps,
            'water_liters': water,
            'sleep_hours': sleep,
            'calories': calories,
        }
    )
    
    return Response({
        'id': metric.id,
        'steps': metric.steps,
        'water_liters': metric.water_liters,
        'sleep_hours': metric.sleep_hours,
        'calories': metric.calories,
        'distance_km': round(metric.steps * 0.000762, 2),
        'calories_burned': round(metric.steps * 0.04),
    })

# GET TODAY'S METRICS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_metrics(request):
    user = request.user
    today = datetime.now().date()
    
    metric = HealthMetric.objects.filter(user=user, date=today).first()

    goal, _ = Goal.objects.get_or_create(user=user)
    
    if metric:
        steps_progress = (metric.steps / goal.daily_steps) * 100
        water_progress = (metric.water_liters / goal.daily_water) * 100
        sleep_progress = (metric.sleep_hours / goal.daily_sleep) * 100
        calories_progress = (metric.calories / goal.daily_calories) * 100
        
        return Response({
            'steps': metric.steps,
            'water_liters': metric.water_liters,
            'sleep_hours': metric.sleep_hours,
            'calories': metric.calories,
            'distance_km': round(metric.steps * 0.000762, 2),
            'calories_burned': round(metric.steps * 0.04),
            'steps_progress': round(steps_progress, 1),
            'water_progress': round(water_progress, 1),
            'sleep_progress': round(sleep_progress, 1),
            'calories_progress': round(calories_progress, 1),
            'daily_goals': {
                'steps': goal.daily_steps,
                'water': goal.daily_water,
                'sleep': goal.daily_sleep,
                'calories': goal.daily_calories,
            }
        })
    
    return Response({
        'steps': 0,
        'water_liters': 0,
        'sleep_hours': 0,
        'calories': 0,
        'distance_km': 0,
        'calories_burned': 0,
        'steps_progress': 0,
        'water_progress': 0,
        'sleep_progress': 0,
        'calories_progress': 0,
        'daily_goals': {
            'steps': goal.daily_steps,
            'water': goal.daily_water,
            'sleep': goal.daily_sleep,
            'calories': goal.daily_calories,
        }
    })

# GET 7-DAY HISTORY
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    user = request.user
    last_7_days = datetime.now().date() - timedelta(days=7)
    
    metrics = HealthMetric.objects.filter(user=user, date__gte=last_7_days).order_by('date')
    
    data = [{
        'date': m.date.isoformat(),
        'steps': m.steps,
        'water_liters': m.water_liters,
        'sleep_hours': m.sleep_hours,
        'calories': m.calories,
    } for m in metrics]
    
    return Response(data)

# GET RECOMMENDATIONS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    recommendations = []
    
    if profile.fitness_score < 30:
        recommendations = [
            {'title': 'Start Walking', 'description': 'Begin with 5000 steps daily', 'category': 'workout', 'difficulty': 'easy'},
            {'title': 'Hydrate More', 'description': 'Drink 2L of water daily', 'category': 'nutrition', 'difficulty': 'easy'},
            {'title': 'Sleep Schedule', 'description': 'Go to bed at same time daily', 'category': 'sleep', 'difficulty': 'easy'},
        ]
    elif profile.fitness_score < 60:
        recommendations = [
            {'title': 'Increase Steps', 'description': 'Aim for 10,000 steps daily', 'category': 'workout', 'difficulty': 'medium'},
            {'title': 'Strength Training', 'description': '3x week bodyweight exercises', 'category': 'workout', 'difficulty': 'medium'},
            {'title': 'Sleep Consistency', 'description': 'Maintain 7-8 hours nightly', 'category': 'sleep', 'difficulty': 'medium'},
        ]
    else:
        recommendations = [
            {'title': 'Advanced Training', 'description': 'Add weight training 4x week', 'category': 'workout', 'difficulty': 'hard'},
            {'title': 'Nutrition Tracking', 'description': 'Log macros daily', 'category': 'nutrition', 'difficulty': 'hard'},
            {'title': 'Peak Performance', 'description': 'Optimize sleep for recovery', 'category': 'sleep', 'difficulty': 'hard'},
        ]
    
    return Response(recommendations)

# STATS SUMMARY
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_summary(request):
    user = request.user
    last_7_days = datetime.now().date() - timedelta(days=7)
    
    metrics = HealthMetric.objects.filter(user=user, date__gte=last_7_days)
    
    total_steps = sum(m.steps for m in metrics)
    avg_water = sum(m.water_liters for m in metrics) / len(metrics) if metrics else 0
    avg_sleep = sum(m.sleep_hours for m in metrics) / len(metrics) if metrics else 0
    total_calories = sum(m.calories for m in metrics)
    
    return Response({
        'total_steps': total_steps,
        'avg_water': round(avg_water, 1),
        'avg_sleep': round(avg_sleep, 1),
        'total_calories': total_calories,
        'days_logged': len(metrics),
    })

