'use client';

import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from './utils/weatherApi';
import WeatherDisplay from './components/WeatherDisplay';

export default function HomePage() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  const handleSearch = async () => {
    setError(null);
    const data = await fetchWeatherData(city);
    if (data && !data.error) {
      setWeatherData(data);
    } else {
      setWeatherData(null);
      setError(data?.error || 'Şehir bulunamadı veya hava durumu bilgisi alınamadı.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Hava Nasıl?</h1>
      {isOffline && (
        <div className="mb-4 text-yellow-500">
          Çevrimdışısınız. Gösterilen veriler en son çevrimiçi olduğunuz zamana ait olabilir.
        </div>
      )}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Şehir Girin"
          className="p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={city}
          onChange={handleInputChange}
          disabled={isOffline}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
          onClick={handleSearch}
          disabled={isOffline}
        >
          Ara
        </button>
      </div>
      <WeatherDisplay weatherData={weatherData} error={error ?? undefined} />
    </div>
  );
}