import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);
      
      // Invalidate auth queries to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      });
      
      // Wait a moment for the auth state to propagate to the router
      setTimeout(() => {
        setLocation("/product-input");
      }, 200);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Mock Google OAuth login
      const mockLoginData = {
        email: "google.user@example.com",
        password: "mock-google-password"
      };

      await apiRequest("POST", "/api/auth/login", mockLoginData);
      
      // Invalidate auth queries to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success!",
        description: "Google login successful.",
      });
      
      // Wait a moment for the auth state to propagate to the router
      setTimeout(() => {
        setLocation("/product-input");
      }, 200);
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google Login Failed",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-inter transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Left Side - Brand Text */}
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">TLC</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
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
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 group"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="animate-fade-in" data-testid="login-form">
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-300/50 dark:border-slate-700/50 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Welcome back
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Sign in to your account
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    data-testid="button-google-login"
                  >
                    <img 
                      src="https://developers.google.com/identity/images/g-logo.png" 
                      alt="Google" 
                      className="w-5 h-5 mr-3"
                    />
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      Continue with Google
                    </span>
                  </Button>

                  {/* Divider */}
                  <div className="relative flex items-center">
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="px-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800">
                      or
                    </span>
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                  </div>

                  {/* Email/Password Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <Label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Email address
                            </Label>
                            <FormControl>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm mt-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                              </Label>
                              <Link href="/forgot-password">
                                <span className="text-sm text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer" data-testid="link-forgot-password">
                                  Forgot password?
                                </span>
                              </Link>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  data-testid="input-password"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
                        disabled={isLoading}
                        data-testid="button-login"
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link href="/signup">
                      <span className="text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 font-medium transition-colors duration-200 cursor-pointer" data-testid="link-signup">
                        Sign up
                      </span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
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
            <span className="text-slate-900 dark:text-slate-200">Signing you in...</span>
          </div>
        </div>
      )}
    </div>
  );
}