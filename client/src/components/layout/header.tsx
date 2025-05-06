import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/lib/types";

interface HeaderProps {
  title: string;
  notifications?: Notification[];
  onCreateNew?: () => void;
  onNotificationsClick?: () => void;
}

export function Header({ title, notifications, onCreateNew, onNotificationsClick }: HeaderProps) {
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="bg-white border-b border-apple-gray-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-apple-gray-900">{title}</h2>
      </div>
      <div className="flex space-x-4 items-center">
        <button 
          className="text-apple-gray-600 hover:text-apple-gray-900 relative"
          onClick={onNotificationsClick}
        >
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
        <Button 
          className="bg-apple-blue text-white hover:bg-opacity-90"
          size="sm"
          onClick={onCreateNew}
        >
          <i className="fas fa-plus mr-1"></i> New
        </Button>
      </div>
    </header>
  );
}
