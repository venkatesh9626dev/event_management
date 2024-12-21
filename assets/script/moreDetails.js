// Initialize the Leaflet map
let map = L.map('map').setView([51.505, -0.09], 13); // Default position
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Function to display the location on the map
function displayLocationOnMap(coords) {
    const latLng = [coords.lat, coords.lng];
    map.setView(latLng, 13); // Set map view to the location

    // Add a marker for the event location
    const marker = L.marker(latLng).addTo(map);
    marker.bindPopup(`<b>Event Location</b><br>Coordinates: ${coords.lat}, ${coords.lng}`).openPopup();
}

