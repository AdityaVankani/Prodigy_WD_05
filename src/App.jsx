import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const fetchCoordinates = async (city) => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    try {
      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_KEY}`);
      if (response.data.length === 0) {
        throw new Error('Location not found');
      }
      const { lat, lon } = response.data[0];
      setLatitude(lat);
      setLongitude(lon);
      fetchWeatherByCoords(lat, lon);
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      setError('Location not found or API key is invalid');
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching the weather data:', err);
      setError('Location not found or API key is invalid');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCoordinates(location);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      fetchWeatherByCoords(latitude, longitude);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Weather App</h1>
      <form onSubmit={handleSearch} className="w-full max-w-md mb-8 flex flex-col items-center space-y-4">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name"
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Search</button>
      </form>
      {latitude && longitude && (
        <p className="mb-6 text-lg">Current Location: {latitude.toFixed(2)}, {longitude.toFixed(2)}</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {weatherData && (
        <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg text-center">
          <h2 className="text-3xl font-semibold mb-4">{weatherData.name}</h2>
          <p className="text-xl mb-2">{weatherData.weather[0].description}</p>
          <p className="text-2xl font-bold mb-4">{weatherData.main.temp}°C</p>
          <div className="flex justify-between mb-4">
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Wind: {weatherData.wind.speed} m/s</p>
          </div>
          <button 
            onClick={toggleDetails} 
            className="w-full px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {showDetails ? 'Hide Details' : 'Show More Details'}
          </button>
          {showDetails && (
            <div className="mt-4 text-left space-y-2">
              <p>Pressure: {weatherData.main.pressure} hPa</p>
              <p>Visibility: {weatherData.visibility / 1000} km</p>
              <p>Cloudiness: {weatherData.clouds.all}%</p>
              <p>Sunrise: {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
              <p>Sunset: {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
