console.log("Hello");

document.addEventListener('DOMContentLoaded', function() {
    // Sunrise and Sunset Formatter
    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    };
    
    // Format sunrise and sunset times
    const sunriseElement = document.getElementById('sunrise-time');
    const sunsetElement = document.getElementById('sunset-time');
    
    if (sunriseElement && sunsetElement) {
        const sunriseTimestamp = parseInt(sunriseElement.textContent);
        const sunsetTimestamp = parseInt(sunsetElement.textContent);
        
        if (!isNaN(sunriseTimestamp) && !isNaN(sunsetTimestamp)) {
            sunriseElement.textContent = formatTime(sunriseTimestamp);
            sunsetElement.textContent = formatTime(sunsetTimestamp);
        }
    }

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
