import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertFieldSchema, SoilTypes } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MapComponent from '@/components/fields/MapComponent';
import { useToast } from '@/hooks/use-toast';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the insert schema with validation
const createFieldSchema = insertFieldSchema.extend({
  name: z.string().min(1, "Field name is required"),
  size: z.number().positive("Size must be greater than 0"),
  soilType: z.string().min(1, "Soil type is required"),
  coordinates: z.string().min(1, "Field boundaries are required"),
});

type CreateFieldValues = z.infer<typeof createFieldSchema>;

export default function AddFieldDialog({ open, onOpenChange }: AddFieldDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coordinates, setCoordinates] = useState<string>("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateFieldValues>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: '',
      size: 0,
      soilType: '',
      history: '',
      coordinates: ''
    }
  });
  
  const createField = useMutation({
    mutationFn: async (data: CreateFieldValues) => {
      const response = await apiRequest('POST', '/api/fields', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      toast({
        title: "Field created",
        description: "The field has been added successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating field",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateFieldValues) => {
    // Ensure coordinates are set
    if (coordinates) {
      data.coordinates = coordinates;
    }
    createField.mutate(data);
  };
  
  const handleBoundaryChange = (newCoordinates: string) => {
    setCoordinates(newCoordinates);
    setValue('coordinates', newCoordinates);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogDescription>
            Create a new field by drawing boundaries on the map and filling in field details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Field Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. North Field" 
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Size (acres)</Label>
              <Input 
                id="size" 
                type="number"
                step="0.1"
                placeholder="e.g. 15"
                {...register('size', { valueAsNumber: true })}
              />
              {errors.size && (
                <p className="text-red-500 text-sm">{errors.size.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select 
                onValueChange={(value) => setValue('soilType', value)}
                defaultValue={watch('soilType')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SoilTypes.CLAY}>Clay</SelectItem>
                  <SelectItem value={SoilTypes.CLAY_LOAM}>Clay Loam</SelectItem>
                  <SelectItem value={SoilTypes.LOAM}>Loam</SelectItem>
                  <SelectItem value={SoilTypes.SANDY_LOAM}>Sandy Loam</SelectItem>
                  <SelectItem value={SoilTypes.SANDY}>Sandy</SelectItem>
                </SelectContent>
              </Select>
              {errors.soilType && (
                <p className="text-red-500 text-sm">{errors.soilType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Field Boundaries</Label>
              <div className="border rounded h-48">
                <MapComponent 
                  fields={[]}
                  editable={true}
                  onBoundaryChange={handleBoundaryChange}
                />
              </div>
              {errors.coordinates && (
                <p className="text-red-500 text-sm">Please draw the field boundaries on the map</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="history">Field History</Label>
              <Textarea 
                id="history" 
                placeholder="Previous crops, treatments, etc."
                {...register('history')}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createField.isPending}
            >
              {createField.isPending ? 'Saving...' : 'Save Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
