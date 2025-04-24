// app/utils/weatherApi.ts
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherData(city: string) {
  if (!API_KEY) {
    console.error('API anahtarı tanımlanmamış!');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=tr`);
    if (!response.ok) {
      const error = await response.json();
      console.error('Hava durumu verisi çekme hatası:', error.message || response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Hava durumu verisi çekme hatası:', error);
    return null;
  }
}