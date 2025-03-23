import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Field, Crop, Input } from '@shared/schema';
import { format } from 'date-fns';
import AddCropDialog from '@/components/crops/AddCropDialog';

// Helper function to get crop progress percentage
const getCropProgress = (plantedDate: Date, harvestDate: Date) => {
  const today = new Date();
  const planted = new Date(plantedDate);
  const harvest = new Date(harvestDate);
  
  const totalDays = Math.max(1, (harvest.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  const daysGrown = Math.max(0, (today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.min(100, Math.max(0, Math.round((daysGrown / totalDays) * 100)));
};

// Helper function to get crop status color
const getCropStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-success';
    case 'needs-water':
      return 'text-warning';
    case 'needs-fertilizer':
      return 'text-amber-500';
    case 'pest-problem':
      return 'text-error';
    case 'disease':
      return 'text-error';
    default:
      return 'text-gray-600';
  }
};

// Helper function to format status label
const formatStatusLabel = (status: string) => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get card header background color
const getCropHeaderColor = (cropName: string) => {
  const cropColors: {[key: string]: string} = {
    'Corn': 'bg-primary-light',
    'Soybean': 'bg-secondary-light',
    'Wheat': 'bg-accent-light',
    'Cotton': 'bg-purple-500',
    'Rice': 'bg-teal-500'
  };
  
  return cropColors[cropName] || 'bg-primary-light';
};

export default function Crops() {
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  
  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });
  
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });

  // Get field name for a crop
  const getFieldName = (fieldId: number) => {
    return fields?.find(field => field.id === fieldId)?.name || 'Unknown Field';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Crops</h1>
        <Button 
          className="flex items-center"
          onClick={() => setIsAddCropOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add_circle</span> Add Crop
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4 bg-gray-300">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-2.5 bg-gray-300 rounded-full mb-1"></div>
                  <div className="flex justify-between h-3 bg-gray-200 rounded w-full mt-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array(4).fill(0).map((_, j) => (
                    <div key={j}>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : crops && crops.length > 0 ? (
          crops.map((crop) => {
            const progress = getCropProgress(crop.plantedDate, crop.harvestDate);
            const statusColor = getCropStatusColor(crop.status);
            const headerColor = getCropHeaderColor(crop.name);
            
            return (
              <Card key={crop.id} className="overflow-hidden">
                <CardHeader className={`p-4 ${headerColor} text-white`}>
                  <h3 className="font-medium">{crop.name} - {getFieldName(crop.fieldId)}</h3>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Growth Progress</div>
                    <Progress value={progress} className="h-2.5 bg-gray-200" />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Planted: {format(new Date(crop.plantedDate), 'MMM d')}</span>
                      <span>Harvest: {format(new Date(crop.harvestDate), 'MMM d')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Seed Type</div>
                      <div>{crop.seedType}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Soil Type</div>
                      <div>{fields?.find(f => f.id === crop.fieldId)?.soilType || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Last Action</div>
                      <div>
                        {crop.lastInput || 'No inputs recorded'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Status</div>
                      <div className={statusColor}>{formatStatusLabel(crop.status)}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-2 bg-gray-50 border-t justify-between">
                  <Button variant="outline" size="sm">Record Input</Button>
                  <Button variant="ghost" className="text-primary text-sm font-medium">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">eco</span>
            <p className="text-gray-500 mb-4">No crops added yet</p>
            <Button onClick={() => setIsAddCropOpen(true)}>
              Add Your First Crop
            </Button>
          </div>
        )}
      </div>
      
      <AddCropDialog 
        open={isAddCropOpen} 
        onOpenChange={setIsAddCropOpen} 
      />
    </div>
  );
}
