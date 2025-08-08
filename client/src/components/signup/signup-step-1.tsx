import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signupStep1Schema, type SignupStep1Data } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SignupStep1Props {
  onNext: (data: SignupStep1Data) => void;
  onGoogleSignup: () => void;
  isLoading?: boolean;
}

export function SignupStep1({ onNext, onGoogleSignup, isLoading }: SignupStep1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupStep1Data>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupStep1Data) => {
    try {
      // Check if email already exists
      const response = await fetch(`/api/auth/check-email/${encodeURIComponent(data.email)}`);
      const { exists } = await response.json();
      
      if (exists) {
        form.setError("email", {
          type: "manual",
          message: "An account with this email already exists",
        });
        return;
      }
      
      onNext(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in" data-testid="signup-step-1">
      <div className="bg-slate-800/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-700/50 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100 dark:text-slate-100 mb-2">
            Create your account
          </h2>
          <p className="text-slate-400 dark:text-slate-400">
            Get started with Total Landed Costs
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 dark:border-slate-600 rounded-xl bg-slate-700/50 dark:bg-slate-700/50 hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors duration-200 group"
            onClick={onGoogleSignup}
            disabled={isLoading}
            data-testid="button-google-signup"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-3"
            />
            <span className="text-slate-200 dark:text-slate-200 font-medium">
              Continue with Google
            </span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-slate-600 dark:border-slate-600"></div>
            <span className="px-3 text-sm text-slate-400 dark:text-slate-400 bg-slate-800 dark:bg-slate-800">
              or
            </span>
            <div className="flex-1 border-t border-slate-600 dark:border-slate-600"></div>
          </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                      Email address
                    </Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    <Label htmlFor="password" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                      Password
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
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
                      Confirm password
                    </Label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
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
                data-testid="button-continue"
              >
                {isLoading ? "Validating..." : "Continue"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-400">
            Already have an account?{" "}
            <a 
              href="#" 
              className="text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              data-testid="link-signin"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
