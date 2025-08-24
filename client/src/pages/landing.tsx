import { Button } from "@/components/ui/button";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, BarChart3, Clock, Shield } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            {/* Left Side - Brand Text */}
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-[#0E4A7E]">
                Total Landed Cost Engine
              </span>
            </div>
            
            {/* Center - Logo Only (Larger) */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src={tfiLogoPath} 
                alt="TFI Logo" 
                className="h-24 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
              />
            </div>
            
            {/* Right Side - Login Button */}
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-login"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Calculate Wine Import Costs
            <span className="block text-primary dark:text-primary/80">
              with Precision
            </span>
          </h1>
          <p className="text-xl text-[#0E4A7E] dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Professional B2B platform for calculating total landed costs of wine imports. 
            Get accurate duty calculations for EU countries with comprehensive customs business logic.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
            data-testid="button-hero-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Calculator className="h-8 w-8 text-primary dark:text-primary/80 mb-2" />
              <CardTitle className="text-foreground">Accurate Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#0E4A7E] dark:text-slate-300">
                Precise customs duty calculations for EU countries with HTS code-specific business logic
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary dark:text-primary/80 mb-2" />
              <CardTitle className="text-foreground">Professional Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#0E4A7E] dark:text-slate-300">
                Detailed cost breakdowns with freight charges and comprehensive duty analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Clock className="h-8 w-8 text-primary dark:text-primary/80 mb-2" />
              <CardTitle className="text-foreground">Fast Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#0E4A7E] dark:text-slate-300">
                Quick calculations with real-time freight rates and automated port selection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary dark:text-primary/80 mb-2" />
              <CardTitle className="text-foreground">Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#0E4A7E] dark:text-slate-300">
                Enterprise-grade security for your business data and calculations
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Calculate Your Wine Import Costs?
            </h2>
            <p className="text-[#0E4A7E] dark:text-slate-300 mb-6">
              Join wine import professionals using our platform for accurate landed cost calculations.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              data-testid="button-cta-login"
            >
              Start Calculating
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}