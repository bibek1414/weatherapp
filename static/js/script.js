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

    // City suggestions functionality
    const searchInput = document.getElementById('query');
    const searchForm = document.getElementById('search-form');

    if (searchInput) {
        // Create suggestions dropdown
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg w-full hidden';
        suggestionsContainer.id = 'suggestions-container';
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(suggestionsContainer);
        
        // Add event listeners for search input
        searchInput.addEventListener('input', debounce(function() {
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.add('hidden');
                return;
            }
            
            // Fetch suggestions
            fetch(`/api/suggestions/?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.suggestions.length === 0) {
                        suggestionsContainer.classList.add('hidden');
                        return;
                    }
                    
                    // Render suggestions
                    let html = '';
                    data.suggestions.forEach(suggestion => {
                        html += `
                            <div class="suggestion-item p-3 hover:bg-gray-100 cursor-pointer">
                                <i class="fas fa-city mr-2 text-weather-primary"></i>
                                ${suggestion}
                            </div>
                        `;
                    });
                    
                    suggestionsContainer.innerHTML = html;
                    suggestionsContainer.classList.remove('hidden');
                    
                    // Add click event to suggestions
                    const suggestionItems = document.querySelectorAll('.suggestion-item');
                    suggestionItems.forEach(item => {
                        item.addEventListener('click', function() {
                            searchInput.value = this.textContent.trim();
                            suggestionsContainer.classList.add('hidden');
                            searchForm.submit();
                        });
                    });
                })
                .catch(error => {
                    console.error('Error fetching suggestions:', error);
                    suggestionsContainer.classList.add('hidden');
                });
        }, 300));
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
        
        // Debounce function to limit API calls
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(context, args);
                }, wait);
            };
        }
    }
});