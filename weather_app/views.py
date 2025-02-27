
from django.shortcuts import render, redirect
from django.contrib import messages
import re
from .models import SearchHistory
from .weather_service import WeatherService
from django.http import JsonResponse

def get_forecast(request):
    """API endpoint to get forecast data"""
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    
    if not lat or not lon:
        return JsonResponse({'error': 'Latitude and longitude are required'}, status=400)
    
    try:
        weather_service = WeatherService()
        forecast_data = weather_service.get_forecast(lat, lon)
        
        if not forecast_data:
            return JsonResponse({'error': 'Could not retrieve forecast data'}, status=404)
        
        return JsonResponse({'forecast': forecast_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def index(request):
    """Home page view with search form"""
    # Get search history for display in the sidebar
    search_history = SearchHistory.objects.all()[:10]
    
    context = {
        'search_history': search_history,
    }
    return render(request, 'weather_app/index.html', context)

def search_weather(request):
    """Process the search form and redirect to results page"""
    if request.method == 'POST':
        query = request.POST.get('query', '').strip()
        
        if not query:
            messages.error(request, 'Please enter a search term.')
            return redirect('index')
        
        # Determine search type based on the query pattern
        search_type = determine_search_type(query)
        
        # Save search to history
        SearchHistory.objects.create(query=query, search_type=search_type)
        
        return redirect('weather_results', query=query, search_type=search_type)
    
    return redirect('index')

def weather_results(request, query, search_type):
    """Show weather results for the search"""
    weather_service = WeatherService()
    weather_data = None
    
    if search_type == 'city':
        weather_data = weather_service.get_weather_by_city(query)
    elif search_type == 'zip':
        zip_code = query.split(',')[0]  # Extract zip code if country code is provided
        weather_data = weather_service.get_weather_by_zip(zip_code)
    elif search_type == 'coords':
        try:
            lat, lon = map(float, query.split(','))
            weather_data = weather_service.get_weather_by_coords(lat, lon)
        except (ValueError, TypeError):
            messages.error(request, 'Invalid coordinates format. Use lat,lon (e.g., 40.7128,-74.0060)')
    
    if not weather_data:
        messages.error(request, f'Could not retrieve weather data for {query}')
        return redirect('index')
    
    # Format weather data for display
    formatted_data = format_weather_data(weather_data)
    
    # Get search history for sidebar
    search_history = SearchHistory.objects.all()[:10]
    
    context = {
        'weather': formatted_data,
        'query': query,
        'search_type': search_type,
        'search_history': search_history,
    }
    return render(request, 'weather_app/results.html', context)

def determine_search_type(query):
    """Determine if the search is for a city, zip code, or coordinates"""
    # Check if query matches coordinates pattern (e.g., 40.7128,-74.0060)
    if re.match(r'^-?\d+(\.\d+)?,-?\d+(\.\d+)?$', query):
        return 'coords'
    
    # Check if query matches zip code pattern
    if re.match(r'^\d{5}(,\w{2})?$', query):  # 5 digits, optional country code
        return 'zip'
    
    # Default to city search
    return 'city'

def format_weather_data(data):
    """Format API response data for template display"""
    try:
        # Extract the information we want to display
        formatted = {
            'city': data['name'],
            'country': data['sys']['country'],
            'temperature': round(data['main']['temp']),
            'feels_like': round(data['main']['feels_like']),
            'description': data['weather'][0]['description'].capitalize(),
            'icon': data['weather'][0]['icon'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed'],
            'pressure': data['main']['pressure'],
            'sunrise': data['sys']['sunrise'],
            'sunset': data['sys']['sunset'],
            'timezone': data['timezone'],
            'coordinates': {
                'lat': data['coord']['lat'],
                'lon': data['coord']['lon']
            }
        }
        return formatted
    except (KeyError, TypeError):
        return None