import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden bg-white border-t shadow-lg">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/') ? 'text-primary' : 'text-gray-600'}`}>
            <span className="material-icons">dashboard</span>
            <span className="text-xs">Dashboard</span>
          </div>
        </Link>
        <Link href="/fields">
          <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/fields') ? 'text-primary' : 'text-gray-600'}`}>
            <span className="material-icons">map</span>
            <span className="text-xs">Fields</span>
          </div>
        </Link>
        <Link href="/crops">
          <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/crops') ? 'text-primary' : 'text-gray-600'}`}>
            <span className="material-icons">eco</span>
            <span className="text-xs">Crops</span>
          </div>
        </Link>
        <Link href="/tasks">
          <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/tasks') ? 'text-primary' : 'text-gray-600'}`}>
            <span className="material-icons">assignment</span>
            <span className="text-xs">Tasks</span>
          </div>
        </Link>
        <Link href="/weather">
          <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/weather') ? 'text-primary' : 'text-gray-600'}`}>
            <span className="material-icons">cloud</span>
            <span className="text-xs">Weather</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
