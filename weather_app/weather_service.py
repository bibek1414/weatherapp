import os
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv('WEATHER_API_KEY')
        self.weather_url = 'https://api.openweathermap.org/data/2.5/weather'
        self.forecast_url = 'https://api.openweathermap.org/data/2.5/forecast'
    
    def get_weather_by_city(self, city_name):
        """Get current weather data by city name"""
        params = {
            'q': city_name,
            'appid': self.api_key,
            'units': 'metric'  # Use 'imperial' for Fahrenheit
        }
        return self._make_api_request(self.weather_url, params)
    
    def get_weather_by_zip(self, zip_code, country_code='us'):
        """Get current weather data by zip code"""
        params = {
            'zip': f"{zip_code},{country_code}",
            'appid': self.api_key,
            'units': 'metric'
        }
        return self._make_api_request(self.weather_url, params)
    
    def get_weather_by_coords(self, lat, lon):
        """Get current weather data by coordinates"""
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'
        }
        return self._make_api_request(self.weather_url, params)
    
    def get_forecast(self, lat, lon, days=5):
        """Get forecast data by coordinates"""
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric',
            'cnt': days * 8  # API returns data in 3-hour intervals (8 per day)
        }
        response = self._make_api_request(self.forecast_url, params)
        
        if response:
            # Process the forecast data to get daily forecasts
            return self._process_forecast_data(response)
        return None
    
    def _process_forecast_data(self, data):
        """Process the raw forecast data to get daily averages"""
        daily_forecasts = {}
        
        for item in data['list']:
            # Convert timestamp to date
            dt = datetime.fromtimestamp(item['dt'])
            date_str = dt.strftime('%Y-%m-%d')
            
            # Initialize the date in our dictionary if it doesn't exist
            if date_str not in daily_forecasts:
                daily_forecasts[date_str] = {
                    'date': date_str,
                    'day_name': dt.strftime('%A'),
                    'temps': [],
                    'weather_ids': [],
                    'descriptions': [],
                    'icons': [],
                    'humidities': [],
                    'wind_speeds': []
                }
            
            # Collect data points for the day
            daily_forecasts[date_str]['temps'].append(item['main']['temp'])
            daily_forecasts[date_str]['weather_ids'].append(item['weather'][0]['id'])
            daily_forecasts[date_str]['descriptions'].append(item['weather'][0]['description'])
            daily_forecasts[date_str]['icons'].append(item['weather'][0]['icon'])
            daily_forecasts[date_str]['humidities'].append(item['main']['humidity'])
            daily_forecasts[date_str]['wind_speeds'].append(item['wind']['speed'])
        
        # Process each day's data
        result = []
        for date_str, data in daily_forecasts.items():
            # Calculate averages
            result.append({
                'date': data['date'],
                'day_name': data['day_name'],
                'temp': round(sum(data['temps']) / len(data['temps'])),
                'weather_id': max(set(data['weather_ids']), key=data['weather_ids'].count),
                'description': max(set(data['descriptions']), key=data['descriptions'].count),
                'icon': max(set(data['icons']), key=data['icons'].count),
                'humidity': round(sum(data['humidities']) / len(data['humidities'])),
                'wind_speed': round(sum(data['wind_speeds']) / len(data['wind_speeds']), 1)
            })
        
        # Sort by date
        result.sort(key=lambda x: x['date'])
        
        return result[:5]  # Return only the first 5 days
    
    def _make_api_request(self, url, params):
        """Make the API request and return the data"""
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching weather data: {e}")
            return None