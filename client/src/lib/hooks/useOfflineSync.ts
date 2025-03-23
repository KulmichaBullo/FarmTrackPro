import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncDate, setSyncDate] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online!",
        description: "Your data will now sync with the cloud.",
      });
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Changes will be saved locally and synced when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const syncData = async () => {
    if (!isOnline) {
      toast({
        title: "Can't sync while offline",
        description: "Please wait until you have an internet connection.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sync date
      const newSyncDate = new Date();
      setSyncDate(newSyncDate);
      
      toast({
        title: "Sync complete",
        description: `Last synced: ${newSyncDate.toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: `Error: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    syncDate,
    isSyncing,
    syncData
  };
}
