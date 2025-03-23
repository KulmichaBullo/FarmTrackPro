import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import MapComponent from '@/components/fields/MapComponent';
import AddFieldDialog from '@/components/fields/AddFieldDialog';
import { Field, Crop } from '@shared/schema';
import { Link } from 'wouter';

export default function FieldsSummary() {
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  const { data: crops } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });

  // Helper function to get crop name for a field
  const getCropForField = (fieldId: number) => {
    return crops?.find(crop => crop.fieldId === fieldId)?.name || 'No crop';
  };

  // Generate a distinct color for each field
  const getFieldColor = (index: number) => {
    const colors = [
      'bg-primary-light',
      'bg-secondary-light',
      'bg-accent-light',
      'bg-purple-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">My Fields</h2>
        <Button 
          variant="ghost" 
          className="flex items-center text-primary font-medium"
          onClick={() => setIsAddFieldOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add_circle</span> Add Field
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <h3 className="font-medium">Field Map Overview</h3>
          <Link href="/fields">
            <Button variant="ghost" size="icon" className="text-white">
              <span className="material-icons">fullscreen</span>
            </Button>
          </Link>
        </div>
        <div className="map-container">
          <MapComponent fields={fields || []} />
        </div>
        <div className="p-4 border-t">
          <div className="flex flex-wrap -mx-2">
            {fieldsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <div className="border rounded p-2 flex items-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : fields && fields.length > 0 ? (
              fields.map((field, index) => (
                <div key={field.id} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                  <div className="border rounded p-2 flex items-center">
                    <div className={`w-4 h-4 rounded-full ${getFieldColor(index)} mr-2`}></div>
                    <div className="flex-grow">
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-600">
                        {getCropForField(field.id)} - {field.size} acres
                      </div>
                    </div>
                    <Link href={`/fields/${field.id}`}>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                        <span className="material-icons">chevron_right</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full p-4 text-center text-gray-500">
                <p>No fields added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AddFieldDialog 
        open={isAddFieldOpen} 
        onOpenChange={setIsAddFieldOpen} 
      />
    </div>
  );
}
