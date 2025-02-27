
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search_weather, name='search_weather'),
    path('results/<str:search_type>/<str:query>/', views.weather_results, name='weather_results'),
    path('api/forecast/', views.get_forecast, name='get_forecast'),  # Add this line
]
