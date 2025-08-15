import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";
import { resetPasswordSchema, type ResetPasswordData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  // Extract token from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", data);
      
      setResetSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password. The link may be expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Left Side - Brand Text */}
                <Link href="/">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                    <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
                  </div>
                </Link>
                
                {/* Center - Logo Only (Larger) */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <img 
                    src={tfiLogoPath} 
                    alt="TFI Logo" 
                    className="h-16 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
                  />
                </div>
                
                {/* Right Side - Theme Toggle */}
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
              <div className="animate-fade-in" data-testid="invalid-token">
                <div className="bg-slate-800/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-700/50 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 mb-2">Invalid reset link</h3>
                    <p className="text-slate-400 dark:text-slate-400 mb-6">
                      This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <div className="space-y-3">
                      <Link href="/forgot-password">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          data-testid="button-request-new-link"
                        >
                          Request new reset link
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full bg-slate-700/50 dark:bg-slate-700/50 border-slate-600 dark:border-slate-600 hover:bg-slate-700 dark:hover:bg-slate-700 text-slate-200 dark:text-slate-200"
                          data-testid="button-back-to-login"
                        >
                          Back to login
                        </Button>
                      </Link>
                    </div>
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

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Left Side - Brand Text */}
                <Link href="/">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                    <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
                  </div>
                </Link>
                
                {/* Center - Logo Only (Larger) */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <img 
                    src={tfiLogoPath} 
                    alt="TFI Logo" 
                    className="h-16 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
                  />
                </div>
                
                {/* Right Side - Theme Toggle */}
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
                <div className="bg-slate-800/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-700/50 p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 mb-2">Password reset successful!</h3>
                    <p className="text-slate-400 dark:text-slate-400 mb-6">
                      Your password has been successfully reset. You can now log in with your new password.
                    </p>
                    <Link href="/login">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        data-testid="button-login-now"
                      >
                        Continue to login
                      </Button>
                    </Link>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <img 
                    src={tfiLogoPath} 
                    alt="TFI Logo" 
                    className="h-12 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-sm"
                  />
                  <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                  <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
                </div>
              </Link>
              
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
            <div className="animate-fade-in" data-testid="reset-password-form">
              <div className="bg-slate-800/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-700/50 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-100 dark:text-slate-100 mb-2">
                    Set new password
                  </h2>
                  <p className="text-slate-400 dark:text-slate-400">
                    Choose a strong password for your account
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="password" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                            New password
                          </Label>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a new password"
                                className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                data-testid="input-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                            Confirm new password
                          </Label>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-sm mt-1" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-800"
                      disabled={isLoading}
                      data-testid="button-reset-password"
                    >
                      {isLoading ? "Resetting..." : "Reset password"}
                    </Button>
                  </form>
                </Form>
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" data-testid="loading-overlay">
          <div className="bg-slate-800 dark:bg-slate-800 rounded-xl p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-slate-200 dark:text-slate-200">Resetting password...</span>
          </div>
        </div>
      )}
    </div>
  );
}