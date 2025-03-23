import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WeatherForecastDay {
  day: string;
  condition: string;
  temperature: number;
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
  
  const {
    data: weather,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<WeatherData>({
    queryKey: ['/api/weather'],
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

  return {
    weather: weather ? {
      temperature: weather.temperature,
      condition: weather.condition,
      humidity: weather.humidity,
      wind: weather.wind,
      alerts: weather.alerts || [],
      forecast: weather.forecast || []
    } : null,
    isLoading,
    isError,
    refetch
  };
}
