import { useWeather } from "@/lib/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

// Helper function to convert Fahrenheit to Celsius
const fahrenheitToCelsius = (fahrenheit: number) => {
  return Math.round((fahrenheit - 32) * 5 / 9);
};

// Helper function to get day of week from date string
const getDayOfWeek = (dayIndex: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();
  date.setDate(date.getDate() + dayIndex);
  return days[date.getDay()];
};

export default function WeatherSummary() {
  const { weather, isLoading, refetch } = useWeather();

  if (isLoading) {
    return (
      <div className="mb-6">
        <Card>
          <div className="p-4 bg-accent text-white flex justify-between items-center">
            <h2 className="text-lg font-medium">Current Weather</h2>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => refetch()}>
              <span className="material-icons">refresh</span>
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-16 w-16 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-5 w-24 mt-2" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </CardContent>
          <div className="flex border-t">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex-1 p-3 text-center border-r last:border-r-0">
                <Skeleton className="h-4 w-8 mx-auto mb-2" />
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-4 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="mb-6">
        <Card>
          <div className="p-4 bg-accent text-white flex justify-between items-center">
            <h2 className="text-lg font-medium">Current Weather</h2>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => refetch()}>
              <span className="material-icons">refresh</span>
            </Button>
          </div>
          <CardContent className="p-8 text-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">cloud_off</span>
            <p className="text-gray-500">Weather data unavailable</p>
            <Button className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-accent text-white flex justify-between items-center">
          <h2 className="text-lg font-medium">Current Weather</h2>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => refetch()}>
            <span className="material-icons">refresh</span>
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="material-icons text-5xl text-accent-light mr-4">
                {getWeatherIcon(weather.condition)}
              </span>
              <div>
                <div className="text-3xl font-light">{fahrenheitToCelsius(weather.temperature)}°C</div>
                <div className="text-gray-600">{weather.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                <span className="material-icons text-xs align-middle">water_drop</span> 
                <span>{weather.humidity}%</span> Humidity
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <span className="material-icons text-xs align-middle">air</span> 
                <span>{weather.wind} mph</span> Wind
              </div>
              {weather.alerts && weather.alerts.length > 0 && (
                <div className="text-error text-sm font-medium">
                  <span className="material-icons text-xs align-middle">warning</span> 
                  <span>{weather.alerts[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-t">
          {weather.forecast && weather.forecast.map((day, index) => (
            <div key={index} className="flex-1 p-3 text-center border-r last:border-r-0">
              <div className="text-sm text-gray-600">{day.day || getDayOfWeek(index)}</div>
              <span className="material-icons text-accent-light">
                {getWeatherIcon(day.condition)}
              </span>
              <div className="text-sm font-medium">{fahrenheitToCelsius(day.temperature)}°C</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
