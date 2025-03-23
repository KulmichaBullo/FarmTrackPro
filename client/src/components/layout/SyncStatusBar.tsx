import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export default function SyncStatusBar() {
  const { syncDate, isSyncing, syncData } = useOfflineSync();
  
  const formatSyncTime = () => {
    return syncDate ? `Today, ${syncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never';
  };

  return (
    <div className="md:hidden bg-gray-800 text-white text-xs py-1 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="material-icons text-xs mr-1">sync</span>
        <span>Last synced: {formatSyncTime()}</span>
      </div>
      <button 
        className="text-white bg-primary-dark px-2 py-0.5 rounded text-xs"
        onClick={syncData}
        disabled={isSyncing}
      >
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
