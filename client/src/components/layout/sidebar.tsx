import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { User } from "@/lib/types";

interface SidebarProps {
  user?: User;
  isMobile?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ user, isMobile, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fa-th-large" },
    { path: "/schedule", label: "Schedule", icon: "fa-calendar-alt" },
    { path: "/students", label: "Students", icon: "fa-user-graduate" },
    { path: "/staff", label: "Staff", icon: "fa-users" },
    { path: "/availability", label: "Availability", icon: "fa-clock" },
    { path: "/matching", label: "Matching", icon: "fa-link" },
    { path: "/conflicts", label: "Conflicts", icon: "fa-exclamation-triangle" }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-apple-gray-200 flex flex-col">
      <div className="p-4 border-b border-apple-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="h-8 w-8 mr-2 text-adelphi-brown"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 2h12a4 4 0 014 4v12a4 4 0 01-4 4H6a4 4 0 01-4-4V6a4 4 0 014-4z" />
            <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h1 className="text-xl font-semibold text-adelphi-brown">Bridges</h1>
        </div>
        {isMobile && (
          <button
            className="md:hidden text-apple-gray-600 hover:text-apple-gray-900"
            onClick={onToggle}
          >
            <i className="fas fa-bars"></i>
          </button>
        )}
      </div>
      <nav className="flex-grow overflow-y-auto p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg",
                    isActive(item.path)
                      ? "text-apple-gray-900 bg-apple-gray-100"
                      : "text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100"
                  )}
                >
                  <i className={`fas ${item.icon} w-5 h-5 mr-3`}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {user && (
        <div className="p-4 border-t border-apple-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-apple-gray-400 flex items-center justify-center text-white mr-2">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-apple-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-apple-gray-600">
                {user.role.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}