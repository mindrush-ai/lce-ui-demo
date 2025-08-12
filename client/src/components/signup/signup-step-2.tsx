import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupStep2Schema, type SignupStep2Data } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface SignupStep2Props {
  onSubmit: (data: SignupStep2Data) => void;
  onBack: () => void;
  isLoading?: boolean;
  initialData?: Partial<SignupStep2Data>;
}

export function SignupStep2({ onSubmit, onBack, isLoading, initialData }: SignupStep2Props) {
  const form = useForm<SignupStep2Data>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      companyName: initialData?.companyName || "",
      acceptedTerms: false,
    },
  });

  return (
    <div className="animate-slide-up" data-testid="signup-step-2">
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-300/50 dark:border-slate-700/50 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Tell us about yourself
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            We need a few more details to set up your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="full-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full name
                  </Label>
                  <FormControl>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      data-testid="input-full-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="company-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company name
                  </Label>
                  <FormControl>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Enter your company name"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      data-testid="input-company-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptedTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 w-4 h-4 text-blue-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <Label htmlFor="terms" className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      I agree to the{" "}
                      <a 
                        href="#" 
                        className="text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 transition-colors duration-200"
                        data-testid="link-terms"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a 
                        href="#" 
                        className="text-blue-400 dark:text-blue-400 hover:text-blue-300 dark:hover:text-blue-300 transition-colors duration-200"
                        data-testid="link-privacy"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                onClick={onBack}
                disabled={isLoading}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
                disabled={isLoading}
                data-testid="button-create-account"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
