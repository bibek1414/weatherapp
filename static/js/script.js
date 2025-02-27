

document.addEventListener('DOMContentLoaded', function() {
    // Geolocation search
    const geolocateBtn = document.getElementById('geolocate-btn');
    
    if (geolocateBtn) {
        geolocateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (navigator.geolocation) {
                geolocateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
                geolocateBtn.disabled = true;
                
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        // Success
                        const lat = position.coords.latitude.toFixed(4);
                        const lon = position.coords.longitude.toFixed(4);
                        const coords = `${lat},${lon}`;
                        
                        // Fill the search input with coordinates
                        document.getElementById('query').value = coords;
                        
                        // Submit the form
                        document.getElementById('search-form').submit();
                    },
                    function(error) {
                        // Error
                        geolocateBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use My Location';
                        geolocateBtn.disabled = false;
                        
                        alert('Could not get your location. Please search manually.');
                        console.error('Geolocation error:', error);
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });
    }
    
    // Search history clicking
    const searchHistoryItems = document.querySelectorAll('.search-history-item');
    searchHistoryItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const query = this.dataset.query;
            
            document.getElementById('query').value = query;
            document.getElementById('search-form').submit();
        });
    });
});