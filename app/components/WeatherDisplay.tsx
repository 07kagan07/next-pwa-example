// app/components/WeatherDisplay.tsx
interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface Props {
  weatherData: WeatherData | null;
  error?: string;
}

const WeatherDisplay: React.FC<Props> = ({ weatherData, error }) => {
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!weatherData) {
    return <p>Hava durumu bilgisi bekleniyor...</p>;
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}@2x.png`;

  return (
    <div className="mt-6 p-4 border rounded-md shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-2">{weatherData.name}</h2>
      <div className="flex items-center mb-2">
        <img src={iconUrl} alt={weatherData.weather[0]?.description} className="w-16 h-16 mr-2" />
        <p className="text-3xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
      </div>
      <p className="text-gray-600 capitalize">{weatherData.weather[0]?.description}</p>
      <p className="text-gray-600">Hissedilen: {Math.round(weatherData.main.feels_like)}°C</p>
      <p className="text-gray-600">Nem: {weatherData.main.humidity}%</p>
      <p className="text-gray-600">Rüzgar: {weatherData.wind.speed} m/s</p>
    </div>
  );
};

export default WeatherDisplay;