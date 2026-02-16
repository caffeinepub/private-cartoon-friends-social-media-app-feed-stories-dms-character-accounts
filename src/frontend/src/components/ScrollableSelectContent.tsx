import { useEffect, useRef, useState } from 'react';
import { SelectContent, SelectScrollUpButton, SelectScrollDownButton } from '@/components/ui/select';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollableSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableSelectContent({ children, className = '' }: ScrollableSelectContentProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setShowTopIndicator(scrollTop > 10);
      setShowBottomIndicator(scrollTop + clientHeight < scrollHeight - 10);
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
            (viewportRef as any).current = viewport;
          }
        }
      }}
    >
      {/* Top scroll indicator */}
      {showTopIndicator && (
        <div className="scroll-indicator scroll-indicator-top">
          <ChevronUp className="h-4 w-4" />
        </div>
      )}

      {children}

      {/* Bottom scroll indicator */}
      {showBottomIndicator && (
        <div className="scroll-indicator scroll-indicator-bottom">
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
    </SelectContent>
  );
}
