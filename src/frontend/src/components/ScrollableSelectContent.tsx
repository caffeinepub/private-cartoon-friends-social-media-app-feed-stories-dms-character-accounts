import {
  SelectContent,
  SelectScrollDownButton,
  SelectScrollUpButton,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScrollableSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollableSelectContent({
  children,
  className = "",
}: ScrollableSelectContentProps) {
  return (
    <SelectContent
      className={`scrollable-select-content ${className}`}
      position="popper"
      sideOffset={4}
    >
      <SelectScrollUpButton className="flex items-center justify-center h-7 cursor-pointer bg-popover border-b border-border hover:bg-accent/20 transition-colors">
        <ChevronUp className="h-4 w-4 text-primary" />
      </SelectScrollUpButton>

      <div className="max-h-[35vh] overflow-y-auto overscroll-contain">
        {children}
      </div>

      <SelectScrollDownButton className="flex items-center justify-center h-7 cursor-pointer bg-popover border-t border-border hover:bg-accent/20 transition-colors">
        <ChevronDown className="h-4 w-4 text-primary" />
      </SelectScrollDownButton>
    </SelectContent>
  );
}
