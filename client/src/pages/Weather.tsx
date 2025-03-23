import { useState, useEffect } from 'react';
import { useWeather } from '@/lib/hooks/useWeather';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Helper function to get weather icon
const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return 'wb_sunny';
  } else if (conditionLower.includes('cloud')) {
    return 'cloud';
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return 'grain';
  } else if (conditionLower.includes('snow')) {
    return 'ac_unit';
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'thunderstorm';
  } else {
    return 'wb_sunny'; // default
  }
};

// Helper function to get day of week from date string
const getDayOfWeek = (dayIndex: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();
  date.setDate(date.getDate() + dayIndex);
  return days[date.getDay()];
};

// Helper function for temperature color
const getTempColor = (temp: number) => {
  if (temp >= 85) return 'text-red-500';
  if (temp >= 75) return 'text-orange-500';
  if (temp >= 65) return 'text-yellow-500';
  if (temp >= 55) return 'text-green-500';
  if (temp >= 45) return 'text-blue-400';
  return 'text-blue-600';
};

export default function Weather() {
  const { weather, isLoading, refetch } = useWeather();
  const { toast } = useToast();
  const [weatherAlerts, setWeatherAlerts] = useState<string[]>([]);
  
  // Update weather alerts when weather data changes
  useEffect(() => {
    if (weather && weather.alerts) {
      setWeatherAlerts(weather.alerts);
    }
  }, [weather]);

  // Dismiss alert
  const dismissAlert = (index: number) => {
    setWeatherAlerts(current => current.filter((_, i) => i !== index));
  };

  // Manual refresh handler
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Weather update",
      description: "Refreshing weather data...",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Weather</h1>
          <Button onClick={handleRefresh} disabled>
            <span className="material-icons mr-1">refresh</span>
            Refresh
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="bg-accent text-white">
            <h2 className="text-lg font-medium">Current Weather</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-accent-light text-white">
            <h2 className="text-lg font-medium">5-Day Forecast</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 last:border-b-0 flex md:flex-col items-center md:items-center justify-between">
                  <Skeleton className="h-5 w-12 mb-2" />
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-8 w-8 rounded-full mb-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-20 md:mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Weather</h1>
          <Button onClick={handleRefresh}>
            <span className="material-icons mr-1">refresh</span>
            Refresh
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <span className="material-icons text-5xl text-gray-400 mb-2">cloud_off</span>
          <h2 className="text-xl font-medium text-gray-600 mb-2">Weather Data Unavailable</h2>
          <p className="text-gray-500 mb-6">Unable to retrieve weather information at this time.</p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Weather</h1>
        <Button onClick={handleRefresh}>
          <span className="material-icons mr-1">refresh</span>
          Refresh
        </Button>
      </div>
      
      {weatherAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {weatherAlerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <span className="material-icons text-xl mt-0.5">warning</span>
                  <div>
                    <AlertTitle>Weather Alert</AlertTitle>
                    <AlertDescription>{alert}</AlertDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 mt-1"
                  onClick={() => dismissAlert(index)}
                >
                  <span className="material-icons text-sm">close</span>
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader className="bg-accent text-white">
          <h2 className="text-lg font-medium">Current Weather</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center">
              <span className="material-icons text-6xl text-accent-light mb-2">
                {getWeatherIcon(weather.condition)}
              </span>
              <div className="text-4xl font-light">{weather.temperature}°F</div>
              <div className="text-gray-600">{weather.condition}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Humidity</div>
                <div className="flex items-center">
                  <span className="material-icons text-accent mr-2">water_drop</span>
                  <span className="text-2xl font-light">{weather.humidity}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Wind</div>
                <div className="flex items-center">
                  <span className="material-icons text-accent mr-2">air</span>
                  <span className="text-2xl font-light">{weather.wind} mph</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm mb-1">Feels Like</div>
                <div className="flex items-center">
                  <span className="material-icons text-accent mr-2">thermostat</span>
                  <span className="text-2xl font-light">{Math.round(weather.temperature * 0.98)}°F</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-accent-light text-white">
          <h2 className="text-lg font-medium">5-Day Forecast</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {weather.forecast && weather.forecast.map((day, index) => (
              <div key={index} className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 last:border-b-0 flex md:flex-col items-center md:items-center justify-between">
                <div className="font-medium md:mb-3">{day.day || getDayOfWeek(index)}</div>
                <div className="flex flex-col items-center md:mb-3">
                  <span className="material-icons text-2xl text-accent-light">
                    {getWeatherIcon(day.condition)}
                  </span>
                  <div className="text-sm text-gray-600">{day.condition}</div>
                </div>
                <div className={`text-lg font-medium ${getTempColor(day.temperature)}`}>
                  {day.temperature}°F
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-gray-100">
            <h2 className="text-lg font-medium">Field-specific Conditions</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center py-6">
              <span className="material-icons text-4xl text-gray-400 mb-2">grass</span>
              <p className="text-gray-500 mb-2">Field-specific weather data will be available soon</p>
              <p className="text-sm text-gray-400">
                Monitor conditions for each of your fields
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-100">
            <h2 className="text-lg font-medium">Historical Data</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center py-6">
              <span className="material-icons text-4xl text-gray-400 mb-2">history</span>
              <p className="text-gray-500 mb-2">Historical weather data will be available soon</p>
              <p className="text-sm text-gray-400">
                Compare current conditions with previous seasons
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
