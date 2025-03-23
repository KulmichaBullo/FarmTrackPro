import { Link, useLocation } from "wouter";
import { useOfflineSync } from "@/lib/hooks/useOfflineSync";

export default function Header() {
  const [location] = useLocation();
  const { isOnline } = useOfflineSync();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-primary text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-icons mr-2">eco</span>
          <h1 className="text-xl font-medium">FarmTrack</h1>
        </div>
        <div className="flex items-center">
          <div className={`${isOnline ? 'online-badge' : 'offline-badge'} mr-4 relative px-2 py-1 ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-xs`}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <button className="p-2 rounded-full hover:bg-primary-dark">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </div>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-primary-dark">
        <div className="container mx-auto px-4">
          <ul className="flex">
            <li className="mr-1">
              <Link href="/">
                <div className={`inline-block px-4 py-2 text-white cursor-pointer ${isActive('/') ? 'bg-primary' : 'hover:bg-primary-light'}`}>Dashboard</div>
              </Link>
            </li>
            <li className="mr-1">
              <Link href="/fields">
                <div className={`inline-block px-4 py-2 text-white cursor-pointer ${isActive('/fields') ? 'bg-primary' : 'hover:bg-primary-light'}`}>Fields</div>
              </Link>
            </li>
            <li className="mr-1">
              <Link href="/crops">
                <div className={`inline-block px-4 py-2 text-white cursor-pointer ${isActive('/crops') ? 'bg-primary' : 'hover:bg-primary-light'}`}>Crops</div>
              </Link>
            </li>
            <li className="mr-1">
              <Link href="/tasks">
                <div className={`inline-block px-4 py-2 text-white cursor-pointer ${isActive('/tasks') ? 'bg-primary' : 'hover:bg-primary-light'}`}>Tasks</div>
              </Link>
            </li>
            <li>
              <Link href="/weather">
                <div className={`inline-block px-4 py-2 text-white cursor-pointer ${isActive('/weather') ? 'bg-primary' : 'hover:bg-primary-light'}`}>Weather</div>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
