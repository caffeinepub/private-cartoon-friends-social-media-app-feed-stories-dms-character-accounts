import { useEffect, useRef, useState } from 'react';
import { SelectContent, SelectScrollUpButton, SelectScrollDownButton } from '@/components/ui/select';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollableSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableSelectContent({ children, className = '' }: ScrollableSelectContentProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setCanScrollUp(scrollTop > 5);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 5);
    };

    // Initial check after a brief delay to ensure content is rendered
    const timer = setTimeout(checkScroll, 100);

    viewport.addEventListener('scroll', checkScroll);
    
    // Use ResizeObserver to detect when content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(viewport);

    return () => {
      clearTimeout(timer);
      viewport.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <SelectContent 
      className={`scrollable-select-content ${className}`}
      ref={(node) => {
        if (node) {
          // Find the viewport element inside SelectContent
          const viewport = node.querySelector('[data-radix-select-viewport]') as HTMLDivElement;
          if (viewport) {
            viewportRef.current = viewport;
          }
        }
      }}
    >
      {/* Radix SelectScrollUpButton - functional scroll button */}
      {canScrollUp && (
        <SelectScrollUpButton className="flex items-center justify-center h-8 bg-gradient-to-b from-popover to-transparent cursor-pointer hover:bg-accent/20 transition-colors">
          <ChevronUp className="h-4 w-4 text-primary" />
        </SelectScrollUpButton>
      )}

      {children}

      {/* Radix SelectScrollDownButton - functional scroll button */}
      {canScrollDown && (
        <SelectScrollDownButton className="flex items-center justify-center h-8 bg-gradient-to-t from-popover to-transparent cursor-pointer hover:bg-accent/20 transition-colors">
          <ChevronDown className="h-4 w-4 text-primary" />
        </SelectScrollDownButton>
      )}
    </SelectContent>
  );
}
