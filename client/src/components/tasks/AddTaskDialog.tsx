import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertTaskSchema, TaskStatus } from '@shared/schema';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend the insert schema with validation
const createTaskSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Task title is required"),
  startDate: z.string().min(1, "Start date is required"),
  workersNeeded: z.number().min(1, "At least one worker is required"),
  status: z.string().min(1, "Status is required")
});

type CreateTaskValues = z.infer<typeof createTaskSchema> & {
  startDate: string;
  endDate?: string;
};

export default function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch fields for dropdown
  const { data: fields } = useQuery({
    queryKey: ['/api/fields'],
    enabled: open // Only fetch when dialog is open
  });
  
  // Fetch crops for dropdown
  const { data: crops } = useQuery({
    queryKey: ['/api/crops'],
    enabled: open // Only fetch when dialog is open
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      fieldId: undefined,
      cropId: undefined,
      startDate: '',
      endDate: '',
      workersNeeded: 1,
      status: TaskStatus.PENDING
    }
  });
  
  const createTask = useMutation({
    mutationFn: async (data: CreateTaskValues) => {
      // Convert string dates to Date objects for the API
      const apiData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined
      };
      const response = await apiRequest('POST', '/api/tasks', apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "The task has been added successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateTaskValues) => {
    createTask.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Schedule a new farming task and assign it to a field or crop.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Apply fertilizer" 
                {...register('title')}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Task details..."
                {...register('description')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldId">Field (Optional)</Label>
                <Select 
                  onValueChange={(value) => setValue('fieldId', parseInt(value))}
                  defaultValue={watch('fieldId')?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">None</SelectItem>
                    {fields && fields.map((field: any) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cropId">Crop (Optional)</Label>
                <Select 
                  onValueChange={(value) => setValue('cropId', parseInt(value))}
                  defaultValue={watch('cropId')?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">None</SelectItem>
                    {crops && crops.map((crop: any) => (
                      <SelectItem key={crop.id} value={crop.id.toString()}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date/Time</Label>
                <Input 
                  id="startDate" 
                  type="datetime-local"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date/Time (Optional)</Label>
                <Input 
                  id="endDate" 
                  type="datetime-local"
                  {...register('endDate')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workersNeeded">Workers Needed</Label>
                <Input 
                  id="workersNeeded" 
                  type="number"
                  min="1"
                  {...register('workersNeeded', { valueAsNumber: true })}
                />
                {errors.workersNeeded && (
                  <p className="text-red-500 text-sm">{errors.workersNeeded.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  onValueChange={(value) => setValue('status', value)}
                  defaultValue={watch('status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status.message}</p>
                )}
              </div>
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
              disabled={createTask.isPending}
            >
              {createTask.isPending ? 'Saving...' : 'Save Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
