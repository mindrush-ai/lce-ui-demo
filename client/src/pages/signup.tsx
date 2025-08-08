import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ProgressIndicator } from "@/components/signup/progress-indicator";
import { SignupStep1 } from "@/components/signup/signup-step-1";
import { SignupStep2 } from "@/components/signup/signup-step-2";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SignupStep1Data, SignupStep2Data } from "@shared/schema";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleStep1Next = (data: SignupStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth integration
      toast({
        title: "Coming Soon",
        description: "Google authentication will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Google signup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (step2Data: SignupStep2Data) => {
    if (!step1Data) return;

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/signup", {
        step1Data,
        step2Data,
      });

      setShowSuccess(true);
      
      // Simulate redirect after success
      setTimeout(() => {
        // TODO: Redirect to dashboard or login
        window.location.href = "/";
      }, 3000);

      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                  <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors duration-200 group"
                  data-testid="button-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-slate-200 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-slate-200 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md space-y-8">
              <div className="animate-bounce-gentle" data-testid="success-state">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 mb-2">Welcome to TLC!</h3>
                  <p className="text-slate-400 dark:text-slate-400 mb-6">Your account has been created successfully. You'll be redirected to your dashboard shortly.</p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="border-t border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-slate-400 dark:text-slate-400">
                <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors duration-200 group"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-slate-200 dark:group-hover:text-slate-200 transition-colors duration-200" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-slate-200 dark:group-hover:text-slate-200 transition-colors duration-200" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            <ProgressIndicator currentStep={currentStep} totalSteps={2} />
            
            {currentStep === 1 && (
              <SignupStep1
                onNext={handleStep1Next}
                onGoogleSignup={handleGoogleSignup}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 2 && (
              <SignupStep2
                onSubmit={handleFinalSubmit}
                onBack={handleStep2Back}
                isLoading={isLoading}
              />
            )}
          </div>
        </main>

        <footer className="border-t border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-slate-400 dark:text-slate-400">
              <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" data-testid="loading-overlay">
          <div className="bg-slate-800 dark:bg-slate-800 rounded-xl p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-slate-200 dark:text-slate-200">Creating your account...</span>
          </div>
        </div>
      )}
    </div>
  );
}
