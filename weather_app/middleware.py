import logging
from django.shortcuts import render

logger = logging.getLogger(__name__)

class WeatherErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        logger.exception("An error occurred: %s", str(exception))
        
        context = {
            'error_message': str(exception),
            'error_type': exception.__class__.__name__
        }
        return render(request, 'weather_app/error.html', context, status=500)