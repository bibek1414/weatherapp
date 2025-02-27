from django.db import models

class SearchHistory(models.Model):
    query = models.CharField(max_length=100)
    search_type = models.CharField(max_length=20)  # city, zip, coords
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.search_type}: {self.query}"