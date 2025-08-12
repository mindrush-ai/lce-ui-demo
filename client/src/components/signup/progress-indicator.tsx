import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex justify-center mb-8" data-testid="progress-indicator">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
              currentStep >= 1 
                ? currentStep > 1 
                  ? "bg-emerald-500 text-white" 
                  : "bg-blue-500 text-white"
                : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}
            data-testid="step-1-indicator"
          >
            1
          </div>
          <span className={cn(
            "ml-2 text-sm font-medium transition-colors duration-200",
            currentStep >= 1 ? "text-slate-900 dark:text-slate-300" : "text-slate-500 dark:text-slate-500"
          )}>
            Account
          </span>
        </div>
        <div className="w-12 h-px bg-slate-300 dark:bg-slate-700"></div>
        <div className="flex items-center">
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
              currentStep >= 2 
                ? currentStep > 2 
                  ? "bg-emerald-500 text-white" 
                  : "bg-blue-500 text-white"
                : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}
            data-testid="step-2-indicator"
          >
            2
          </div>
          <span className={cn(
            "ml-2 text-sm font-medium transition-colors duration-200",
            currentStep >= 2 ? "text-slate-900 dark:text-slate-300" : "text-slate-500 dark:text-slate-500"
          )}>
            Details
          </span>
        </div>
      </div>
    </div>
  );
}
