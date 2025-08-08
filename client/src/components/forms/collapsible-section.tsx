import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onActivate: () => void;
  children: React.ReactNode;
  completedSummary?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  isActive,
  isCompleted,
  onActivate,
  children,
  completedSummary,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (isCompleted && !isActive) {
      setIsExpanded(!isExpanded);
    } else if (!isActive) {
      onActivate();
    }
  };

  // Show expanded content if:
  // 1. Section is currently active, OR
  // 2. Section is completed and user has manually expanded it
  const showContent = isActive || (isCompleted && isExpanded);

  return (
    <div 
      className={cn(
        "border rounded-xl transition-all duration-300",
        isActive 
          ? "border-blue-500 shadow-lg shadow-blue-500/10" 
          : isCompleted 
            ? "border-emerald-500/30 bg-emerald-500/5" 
            : "border-slate-600 bg-slate-800/30"
      )}
      data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer rounded-t-xl",
          isActive ? "bg-blue-500/10" : isCompleted ? "bg-emerald-500/10" : "bg-slate-800/50"
        )}
        onClick={handleToggle}
        data-testid={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
              isCompleted 
                ? "bg-emerald-500 text-white" 
                : isActive 
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-400"
            )}
          >
            {isCompleted ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">1</span>
            )}
          </div>
          <h3 className={cn(
            "text-lg font-semibold transition-colors duration-200",
            isActive ? "text-blue-300" : isCompleted ? "text-emerald-300" : "text-slate-300"
          )}>
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {isCompleted && !isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
              data-testid={`button-edit-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          
          {isCompleted && !isActive ? (
            isExpanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )
          ) : null}
        </div>
      </div>

      {/* Completed Summary - Only show when collapsed */}
      {isCompleted && !showContent && completedSummary && (
        <div className="px-4 pb-4">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            {completedSummary}
          </div>
        </div>
      )}

      {/* Section Content */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showContent ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}