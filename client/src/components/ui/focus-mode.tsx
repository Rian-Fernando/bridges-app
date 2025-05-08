
import React from 'react';
import { Button } from './button';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FocusMode() {
  const [isActive, setIsActive] = React.useState(false);
  const { toast } = useToast();

  const toggleFocusMode = () => {
    setIsActive(!isActive);
    document.body.classList.toggle('focus-mode');
    
    toast({
      title: isActive ? "Focus mode disabled" : "Focus mode enabled",
      description: isActive 
        ? "All UI elements are now visible" 
        : "Non-essential UI elements are hidden",
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFocusMode}
      className="hover:bg-accent"
    >
      {isActive ? (
        <EyeOff className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Eye className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle focus mode</span>
    </Button>
  );
}
