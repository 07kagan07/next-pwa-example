'use client';

import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from './utils/weatherApi';
import WeatherDisplay from './components/WeatherDisplay';

export default function HomePage() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedWeatherData, setCachedWeatherData] = useState<any | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sayfa yüklendiğinde ve offline durumuna geçildiğinde önbellekten veri oku
    if (isOffline) {
      loadCachedData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  useEffect(() => {
    // Online duruma geçildiğinde önbelleği temizle (isteğe bağlı)
    if (!isOffline) {
      setCachedWeatherData(null);
    }
  }, [isOffline]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  const handleSearch = async () => {
    if (!city) {
      setError('Lütfen bir şehir adı girin.');
      return;
    }

    setError(null);

    if (isOffline) {
      await loadCachedData();
    } else {
      try {
        const data = await fetchWeatherData(city);
        if (data) {
          setWeatherData(data);
          saveWeatherDataToCache(city, data);
        } else {
          setError('Şehir bulunamadı veya hava durumu bilgisi alınamadı.');
        }
      } catch (error) {
        setError('Hava durumu bilgisi alınırken bir hata oluştu.');
      }
    }
  };

  const loadCachedData = async () => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('hava-nasil-weather-data-cache-v1');
        const keys = await cache.keys();
        const latestRequest = keys.find((key) =>
          key.url.includes('api.openweathermap.org/data/2.5/weather')
        );

        if (latestRequest) {
          const cachedResponse = await cache.match(latestRequest);
          if (cachedResponse) {
            const cachedData = await cachedResponse.json();
            setCachedWeatherData(cachedData);
          }
        }
      } catch (error) {
        console.error('Önbellekten veri okuma hatası:', error);
      }
    }
  };

  const saveWeatherDataToCache = async (city: string, data: any) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('hava-nasil-weather-data-cache-v1');
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=tr`;
        const response = new Response(JSON.stringify(data));
        await cache.put(url, response);
      } catch (error) {
        console.error('Önbelleğe veri kaydetme hatası:', error);
      }
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
      <WeatherDisplay weatherData={isOffline ? cachedWeatherData : weatherData} error={error ?? undefined} />
    </div>
  );
}