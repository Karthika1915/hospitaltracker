# Project Viva Guide: Feature Explanation

## How "Current Location" Works

If your external examiner or professor asks **"How did you implement the location feature?"**, use this explanation:

### 1. Requesting Permission
"We use the browser's built-in **Geolocation API**. When the user clicks 'Detect Location', the app runs `navigator.geolocation.getCurrentPosition()`. This triggers a secure popup asking the user for permission to share their location."

### 2. Fetching Latitude & Longitude
"Once permission is granted, the API communicates with the device's GPS or Wi-Fi network to return the precise **Latitude** (e.g., 13.08) and **Longitude** (e.g., 80.27)."

### 3. Reverse Geocoding (Converting to Address)
"To show a readable address like 'Anna Nagar, Chennai' instead of raw numbers, we use **Reverse Geocoding**. We send the coordinates to the **OpenStreetMap (Nominatim) API**, which returns the city and area name to display on the UI."

### 4. Distance Calculation & Sorting
"We use the **Haversine Formula** to calculate the straight-line distance (in km) between the user's coordinates and each hospital in our database. The hospital list is then sorted in ascending order of this distance, ensuring the nearest emergency care is shown first."

---

## Technical Snippet (For Code Walkthrough)
```javascript
// Current Implementation in Hero.jsx
navigator.geolocation.getCurrentPosition(async (pos) => {
    // 1. Get Coords
    const { latitude, longitude } = pos.coords;
    
    // 2. Reverse Geocode (Get Address)
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&...`);
    const data = await res.json();
    
    // 3. Update UI
    setLocationName(data.address.city);
});
```
