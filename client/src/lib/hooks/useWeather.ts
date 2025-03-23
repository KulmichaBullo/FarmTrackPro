import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WeatherForecastDay {
  day: string;
  condition: string;
  temperature: number;
}

interface WeatherApiResponse {
  temperature: number;
  condition: string;
  humidity: number;
  wind: number;
  alerts: string; // JSON string
  forecast: string; // JSON string
  id: number;
  date: string;
  createdAt: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  wind: number;
  alerts: string[];
  forecast: WeatherForecastDay[];
}

export function useWeather() {
  const { toast } = useToast();
  const location = useLocation();
  
  const {
    data: weatherResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<WeatherApiResponse>({
    queryKey: ['/api/weather', location.coordinates],
    queryFn: async () => {
      if (location.error) {
        throw new Error(`Location error: ${location.error}`);
      }
      if (!location.coordinates.latitude || !location.coordinates.longitude) {
        throw new Error('Location not available yet');
      }
      const response = await fetch(`/api/weather/openweather?lat=${location.coordinates.latitude}&lon=${location.coordinates.longitude}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: !location.loading && !location.error && !!location.coordinates.latitude,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Weather Update Failed",
        description: `Could not fetch weather data: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Parse JSON strings from the API response
  const parseWeatherData = (data: WeatherApiResponse): WeatherData => {
    let alerts: string[] = [];
    let forecast: WeatherForecastDay[] = [];
    
    try {
      alerts = JSON.parse(data.alerts);
    } catch (e) {
      console.error('Failed to parse weather alerts:', e);
    }
    
    try {
      forecast = JSON.parse(data.forecast);
    } catch (e) {
      console.error('Failed to parse weather forecast:', e);
    }
    
    return {
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity,
      wind: data.wind,
      alerts,
      forecast
    };
  };

  const weather = weatherResponse ? parseWeatherData(weatherResponse) : null;

  return {
    weather,
    isLoading,
    isError,
    refetch
  };
}
