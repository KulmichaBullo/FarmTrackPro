import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Task } from '@shared/schema';
import { format } from 'date-fns';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';

// Helper function to generate task status styles
const getTaskStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        className: 'border-warning text-warning',
        label: 'Due Today'
      };
    case 'in-progress':
      return {
        className: 'border-info text-info',
        label: 'In Progress'
      };
    case 'completed':
      return {
        className: 'border-success text-success',
        label: 'Completed'
      };
    default:
      return {
        className: 'border-gray-400 text-gray-600',
        label: status
      };
  }
};

// Helper function to format time
const formatTime = (date: Date) => {
  return format(new Date(date), 'h:mm a');
};

export default function TasksSummary() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Get today's tasks only
  const todaysTasks = tasks?.filter(task => {
    const taskDate = new Date(task.startDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Today's Tasks</h2>
        <Button 
          variant="ghost" 
          className="flex items-center text-primary font-medium"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add_circle</span> New Task
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : todaysTasks && todaysTasks.length > 0 ? (
        <>
          {todaysTasks.map((task) => {
            const statusStyle = getTaskStatusStyle(task.status);
            return (
              <div key={task.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                <div className={`p-4 border-l-4 ${statusStyle.className.split(' ')[0]}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={`text-sm font-medium ${statusStyle.className.split(' ')[1]}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="material-icons text-xs mr-1">schedule</span>
                      <span>
                        {task.startDate && formatTime(new Date(task.startDate))} - 
                        {task.endDate && formatTime(new Date(task.endDate))}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-xs mr-1">person</span>
                      <span>{task.workersNeeded} worker{task.workersNeeded !== 1 ? 's' : ''} needed</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <span className="material-icons text-4xl text-gray-400 mb-2">event_busy</span>
          <p className="text-gray-500 mb-4">No tasks scheduled for today</p>
          <Button onClick={() => setIsAddTaskOpen(true)}>
            Schedule a Task
          </Button>
        </div>
      )}
      
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
      />
    </div>
  );
}
