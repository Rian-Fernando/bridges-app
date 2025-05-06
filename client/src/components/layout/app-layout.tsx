import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useLocation } from "wouter";
import { User, Notification } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch current user (admin for now)
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });

  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', { userId: user?.id }],
    enabled: !!user?.id,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Set page title based on current route
    switch (location) {
      case "/":
        setPageTitle("Dashboard");
        break;
      case "/schedule":
        setPageTitle("Schedule");
        break;
      case "/students":
        setPageTitle("Students");
        break;
      case "/staff":
        setPageTitle("Staff");
        break;
      case "/availability":
        setPageTitle("Availability");
        break;
      case "/matching":
        setPageTitle("Matching");
        break;
      case "/conflicts":
        setPageTitle("Conflicts");
        break;
      default:
        setPageTitle("Bridges");
    }
  }, [location]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar 
              user={user} 
              isMobile={true} 
              onToggle={handleToggleSidebar} 
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {(!isMobile || !isSidebarOpen) && (
        <div className={isMobile ? "hidden" : "block"}>
          <Sidebar user={user} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto flex flex-col h-screen">
        <Header 
          title={pageTitle} 
          notifications={notifications}
          onCreateNew={() => {}}
          onNotificationsClick={() => {}}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
