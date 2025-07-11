
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind } from "lucide-react";

const API_KEY = "6a90f6c6e04148bd8a681557251107";
const LOCATION = "Gujarat, India";

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(LOCATION)}`
        );
        if (!res.ok) throw new Error("Failed to fetch weather data");
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span>Weather Forecast</span>
          <span className="text-sm font-normal text-gray-500">- {LOCATION}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading weather...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : weather ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {weather.current.temp_c}°C
                </div>
                <div className="text-gray-600 flex items-center justify-center space-x-2">
                  <img
                    src={weather.current.condition.icon}
                    alt={weather.current.condition.text}
                    className="h-6 w-6 inline-block"
                  />
                  <span>{weather.current.condition.text}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <span>Humidity: {weather.current.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind: {weather.current.wind_kph} km/h</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg text-gray-700 font-medium">
                {weather.location.name}, {weather.location.region}
              </div>
              <div className="text-sm text-gray-500">{weather.location.country}</div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Farming Alert</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {/* You can update this message based on weather.current.condition.text if desired */}
            {weather && weather.current.condition.text.includes("rain")
              ? "Rain expected. Consider postponing pesticide application and check drainage systems."
              : "No rain expected. Good time for field work."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
