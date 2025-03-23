import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCropSchema, CropStatus } from '@shared/schema';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AddCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the insert schema with validation
const createCropSchema = insertCropSchema.extend({
  fieldId: z.number().min(1, "Field selection is required"),
  name: z.string().min(1, "Crop name is required"),
  seedType: z.string().min(1, "Seed type is required"),
  plantedDate: z.string().min(1, "Planted date is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  status: z.string().min(1, "Status is required")
});

type CreateCropValues = z.infer<typeof createCropSchema> & {
  plantedDate: string;
  harvestDate: string;
};

export default function AddCropDialog({ open, onOpenChange }: AddCropDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch fields for dropdown
  const { data: fields } = useQuery({
    queryKey: ['/api/fields'],
    enabled: open // Only fetch when dialog is open
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateCropValues>({
    resolver: zodResolver(createCropSchema),
    defaultValues: {
      fieldId: 0,
      name: '',
      seedType: '',
      plantedDate: '',
      harvestDate: '',
      status: CropStatus.HEALTHY,
      notes: ''
    }
  });
  
  const createCrop = useMutation({
    mutationFn: async (data: CreateCropValues) => {
      // Convert string dates to Date objects for the API
      const apiData = {
        ...data,
        plantedDate: new Date(data.plantedDate),
        harvestDate: new Date(data.harvestDate)
      };
      const response = await apiRequest('POST', '/api/crops', apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      toast({
        title: "Crop created",
        description: "The crop has been added successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating crop",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateCropValues) => {
    createCrop.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Crop</DialogTitle>
          <DialogDescription>
            Add a new crop to your field with planting and harvesting details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fieldId">Field</Label>
              <Select 
                onValueChange={(value) => setValue('fieldId', parseInt(value))}
                defaultValue={watch('fieldId').toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {fields && fields.map((field: any) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fieldId && (
                <p className="text-red-500 text-sm">{errors.fieldId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Corn" 
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seedType">Seed Type</Label>
              <Input 
                id="seedType" 
                placeholder="e.g. Pioneer P9998" 
                {...register('seedType')}
              />
              {errors.seedType && (
                <p className="text-red-500 text-sm">{errors.seedType.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plantedDate">Planted Date</Label>
                <Input 
                  id="plantedDate" 
                  type="date"
                  {...register('plantedDate')}
                />
                {errors.plantedDate && (
                  <p className="text-red-500 text-sm">{errors.plantedDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input 
                  id="harvestDate" 
                  type="date"
                  {...register('harvestDate')}
                />
                {errors.harvestDate && (
                  <p className="text-red-500 text-sm">{errors.harvestDate.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Crop Status</Label>
              <Select 
                onValueChange={(value) => setValue('status', value)}
                defaultValue={watch('status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CropStatus.HEALTHY}>Healthy</SelectItem>
                  <SelectItem value={CropStatus.NEEDS_WATER}>Needs Water</SelectItem>
                  <SelectItem value={CropStatus.NEEDS_FERTILIZER}>Needs Fertilizer</SelectItem>
                  <SelectItem value={CropStatus.PEST_PROBLEM}>Pest Problem</SelectItem>
                  <SelectItem value={CropStatus.DISEASE}>Disease</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional details about this crop"
                {...register('notes')}
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
              disabled={createCrop.isPending}
            >
              {createCrop.isPending ? 'Saving...' : 'Save Crop'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
