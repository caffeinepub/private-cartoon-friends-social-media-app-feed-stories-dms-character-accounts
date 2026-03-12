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
    <SelectContent className={className}>
      <SelectScrollUpButton className="flex items-center justify-center h-8 cursor-pointer hover:bg-accent/20 transition-colors">
        <ChevronUp className="h-4 w-4 text-primary" />
      </SelectScrollUpButton>

      {children}

      <SelectScrollDownButton className="flex items-center justify-center h-8 cursor-pointer hover:bg-accent/20 transition-colors">
        <ChevronDown className="h-4 w-4 text-primary" />
      </SelectScrollDownButton>
    </SelectContent>
  );
}
