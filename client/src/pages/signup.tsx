import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";
import { ProgressIndicator } from "@/components/signup/progress-indicator";
import { SignupStep1 } from "@/components/signup/signup-step-1";
import { SignupStep2 } from "@/components/signup/signup-step-2";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SignupStep1Data, SignupStep2Data } from "@shared/schema";
import { useLocation } from "wouter";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
      // Mock Google OAuth integration
      const mockGoogleUser = {
        step1Data: {
          email: "google.user@example.com",
          password: "mock-google-password",
          confirmPassword: "mock-google-password"
        },
        step2Data: {
          fullName: "Google Test User",
          companyName: "Test Company Inc.",
          acceptedTerms: true
        }
      };

      await apiRequest("POST", "/api/auth/signup", mockGoogleUser);

      // Invalidate auth queries to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success!",
        description: "Google account created successfully.",
      });
      
      // Wait for auth state to propagate before redirecting
      setTimeout(() => {
        setLocation("/product-input");
      }, 1200);

    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        title: "Error",
        description: "Failed to create Google account. Please try again.",
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

      // Invalidate auth queries to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setShowSuccess(true);
      
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
      
      // Redirect to product input page after success (longer delay for success animation)
      setTimeout(() => {
        setLocation("/product-input");
      }, 2200);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-[#0E4A7E] dark:text-slate-100 font-inter transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between">
                {/* Left Side - Brand Text */}
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-semibold text-[#0E4A7E]">TLC</span>
                  <span className="text-lg text-[#0E4A7E] hidden sm:inline">Total Landed Cost Engine</span>
                </div>
                
                {/* Center - Logo Only (Larger) */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <img 
                    src={tfiLogoPath} 
                    alt="TFI Logo" 
                    className="h-24 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
                  />
                </div>
                
                {/* Right Side - Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 group"
                  data-testid="button-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  ) : (
                    <Moon className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md space-y-8">
              <div className="animate-bounce-gentle" data-testid="success-state">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Welcome to TLC!</h3>
                  <p className="text-[#0E4A7E] dark:text-slate-400 mb-6">Your account has been created successfully. You'll be redirected to your dashboard shortly.</p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-[#0E4A7E] dark:text-slate-400">
                <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-[#0E4A7E] dark:text-slate-100 font-inter transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={tfiLogoPath} 
                  alt="TFI Logo" 
                  className="h-12 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-sm"
                />
                <span className="text-2xl font-semibold text-[#0E4A7E]">TLC</span>
                <span className="text-lg text-[#0E4A7E] hidden sm:inline">Total Landed Cost Engine</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 group"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                ) : (
                  <Moon className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
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

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-[#0E4A7E] dark:text-slate-400">
              <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" data-testid="loading-overlay">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center space-x-3 border border-slate-300 dark:border-slate-700">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-[#0E4A7E] dark:text-slate-200">Creating your account...</span>
          </div>
        </div>
      )}
    </div>
  );
}
