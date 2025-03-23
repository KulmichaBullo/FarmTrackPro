import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MapComponent from '@/components/fields/MapComponent';
import AddFieldDialog from '@/components/fields/AddFieldDialog';
import { Field, Crop } from '@shared/schema';

export default function Fields() {
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  const { data: crops } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Fields</h1>
        <Button 
          className="flex items-center"
          onClick={() => setIsAddFieldOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add_circle</span> Add Field
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 bg-primary text-white">
              <h2 className="text-lg font-medium">Field Map</h2>
            </CardHeader>
            <div className="h-[500px]">
              <MapComponent fields={fields || []} />
            </div>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="p-4 bg-gray-100">
              <h2 className="text-lg font-medium">Field List</h2>
            </CardHeader>
            <CardContent className="p-4">
              {fieldsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-3 border rounded animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : fields && fields.length > 0 ? (
                <div className="space-y-3">
                  {fields.map((field) => {
                    const fieldCrops = crops?.filter(crop => crop.fieldId === field.id) || [];
                    
                    return (
                      <div key={field.id} className="p-3 border rounded hover:bg-gray-50">
                        <h3 className="font-medium">{field.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {field.size} acres - {field.soilType}
                        </div>
                        {fieldCrops.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Crops: {fieldCrops.map(crop => crop.name).join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="material-icons text-4xl text-gray-400 mb-2">map</span>
                  <p className="text-gray-500 mb-4">No fields added yet</p>
                  <Button onClick={() => setIsAddFieldOpen(true)}>
                    Add Your First Field
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AddFieldDialog 
        open={isAddFieldOpen} 
        onOpenChange={setIsAddFieldOpen} 
      />
    </div>
  );
}
