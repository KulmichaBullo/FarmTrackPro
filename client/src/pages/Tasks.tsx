import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, Field, Crop } from '@shared/schema';
import { format } from 'date-fns';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Helper function to generate task status styles
const getTaskStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        borderClass: 'border-warning',
        textClass: 'text-warning',
        label: 'Pending',
        icon: 'schedule',
        buttonLabel: 'Start Task'
      };
    case 'in-progress':
      return {
        borderClass: 'border-info',
        textClass: 'text-info',
        label: 'In Progress',
        icon: 'sync',
        buttonLabel: 'Complete Task'
      };
    case 'completed':
      return {
        borderClass: 'border-success',
        textClass: 'text-success',
        label: 'Completed',
        icon: 'check_circle',
        buttonLabel: 'View Details'
      };
    default:
      return {
        borderClass: 'border-gray-400',
        textClass: 'text-gray-600',
        label: status,
        icon: 'help',
        buttonLabel: 'View Task'
      };
  }
};

// Helper function to format date
const formatDate = (date: Date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

// Helper function to format time
const formatTime = (date: Date) => {
  return format(new Date(date), 'h:mm a');
};

export default function Tasks() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  const { data: fields } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
  });
  
  const { data: crops } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });

  // Helper function to get entity name
  const getEntityName = (type: 'field' | 'crop', id?: number) => {
    if (!id) return 'General';
    
    if (type === 'field') {
      return fields?.find(field => field.id === id)?.name || 'Unknown Field';
    } else {
      return crops?.find(crop => crop.id === id)?.name || 'Unknown Crop';
    }
  };

  // Update task status mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "The task status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle task action button click
  const handleTaskAction = (task: Task) => {
    let newStatus;
    
    if (task.status === 'pending') {
      newStatus = 'in-progress';
    } else if (task.status === 'in-progress') {
      newStatus = 'completed';
    } else {
      // If already completed, just show details
      return;
    }
    
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  // Group tasks by status
  const pendingTasks = tasks?.filter(task => task.status === 'pending') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'in-progress') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  // Sort tasks by start date (ascending for pending, descending for completed)
  pendingTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  inProgressTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  completedTasks.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Tasks</h1>
        <Button 
          className="flex items-center"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add_circle</span> Add Task
        </Button>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-warning text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="relative">
            In Progress
            {inProgressTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-info text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {inProgressTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {pendingTasks.map((task) => {
                const statusStyle = getTaskStatusStyle(task.status);
                return (
                  <Card key={task.id} className={`border-l-4 ${statusStyle.borderClass}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`flex items-center text-sm font-medium ${statusStyle.textClass}`}>
                          <span className="material-icons text-sm mr-1">{statusStyle.icon}</span>
                          {statusStyle.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {task.description}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                        {task.fieldId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">map</span>
                            <span>Field: {getEntityName('field', task.fieldId)}</span>
                          </div>
                        )}
                        
                        {task.cropId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">eco</span>
                            <span>Crop: {getEntityName('crop', task.cropId)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">calendar_today</span>
                          <span>Date: {formatDate(new Date(task.startDate))}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">schedule</span>
                          <span>Time: {formatTime(new Date(task.startDate))} - {task.endDate ? formatTime(new Date(task.endDate)) : 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">person</span>
                          <span>{task.workersNeeded} worker{task.workersNeeded !== 1 ? 's' : ''} needed</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTaskAction(task)}
                          disabled={updateTask.isPending}
                        >
                          {statusStyle.buttonLabel}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">event_available</span>
                <p className="text-gray-500 mb-4">No pending tasks</p>
                <Button onClick={() => setIsAddTaskOpen(true)}>
                  Schedule a Task
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="in-progress">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : inProgressTasks.length > 0 ? (
            <div className="space-y-4">
              {inProgressTasks.map((task) => {
                const statusStyle = getTaskStatusStyle(task.status);
                return (
                  <Card key={task.id} className={`border-l-4 ${statusStyle.borderClass}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`flex items-center text-sm font-medium ${statusStyle.textClass}`}>
                          <span className="material-icons text-sm mr-1">{statusStyle.icon}</span>
                          {statusStyle.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {task.description}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                        {task.fieldId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">map</span>
                            <span>Field: {getEntityName('field', task.fieldId)}</span>
                          </div>
                        )}
                        
                        {task.cropId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">eco</span>
                            <span>Crop: {getEntityName('crop', task.cropId)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">calendar_today</span>
                          <span>Date: {formatDate(new Date(task.startDate))}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">schedule</span>
                          <span>Time: {formatTime(new Date(task.startDate))} - {task.endDate ? formatTime(new Date(task.endDate)) : 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">person</span>
                          <span>{task.workersNeeded} worker{task.workersNeeded !== 1 ? 's' : ''} needed</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTaskAction(task)}
                          disabled={updateTask.isPending}
                        >
                          {statusStyle.buttonLabel}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">hourglass_empty</span>
                <p className="text-gray-500 mb-4">No tasks in progress</p>
                <Button onClick={() => setIsAddTaskOpen(true)}>
                  Schedule a Task
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedTasks.length > 0 ? (
            <div className="space-y-4">
              {completedTasks.map((task) => {
                const statusStyle = getTaskStatusStyle(task.status);
                return (
                  <Card key={task.id} className={`border-l-4 ${statusStyle.borderClass}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`flex items-center text-sm font-medium ${statusStyle.textClass}`}>
                          <span className="material-icons text-sm mr-1">{statusStyle.icon}</span>
                          {statusStyle.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                        {task.fieldId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">map</span>
                            <span>Field: {getEntityName('field', task.fieldId)}</span>
                          </div>
                        )}
                        
                        {task.cropId && (
                          <div className="flex items-center">
                            <span className="material-icons text-xs mr-1">eco</span>
                            <span>Crop: {getEntityName('crop', task.cropId)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">calendar_today</span>
                          <span>Completed: {formatDate(new Date(task.startDate))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">check_circle_outline</span>
                <p className="text-gray-500">No completed tasks yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
      />
    </div>
  );
}
