import { Button } from "@/components/ui/button";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, BarChart3, Clock, Shield, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="flex items-center justify-between">
            {/* Left Side - Brand Text */}
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl font-semibold text-[#0E4A7E] dark:text-foreground">TLC</span>
              <span className="text-base text-[#0E4A7E] dark:text-muted-foreground hidden md:inline">Total Landed Cost Engine</span>
            </div>
            
            {/* Center - Logo Only (Responsive) */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src={tfiLogoPath} 
                alt="TFI Logo" 
                className="h-10 sm:h-16 md:h-20 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
              />
            </div>
            
            {/* Right Side - Theme Toggle and Start Button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 group"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                )}
              </Button>
              
              <Link href="/product-input">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-base px-3 sm:px-4"
                  data-testid="button-start"
                >
                  <span className="hidden sm:inline">Start Engine</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0E4A7E] dark:text-foreground mb-2">
            DOES YOUR U.S. IMPORT PROGRAM
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-[#0E4A7E] dark:text-primary/80 mb-6">
            NEED SOME "TLC"?
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#0E4A7E] dark:text-foreground mb-2 max-w-4xl mx-auto">
            INTRODUCTION TO THE TRADE FACILITATORS, INC.
          </h3>
          <h4 className="text-2xl md:text-3xl font-semibold text-[#0E4A7E] dark:text-foreground mb-8 max-w-4xl mx-auto">
            TOTAL LANDED COST ENGINE
          </h4>
        </div>

        {/* Body Content */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed space-y-6">
              <p className="text-[#0E4A7E] dark:text-muted-foreground">
                Welcome to the complimentary version of the Trade Facilitators, Inc. Total Landed Cost Engine! Designed for U.S. importers, this tool calculates a product's landed cost by summing its unit cost, applicable customs duties and item-level maritime transport costs.
              </p>
              <p className="text-[#0E4A7E] dark:text-muted-foreground">
                Please be advised that certain data points are needed to generate the total landed cost of your item. Upon inputting information that includes unit cost, country of origin, HTS #, port of loading and port of discharge, the engine will produce an easy-to-understand, product-specific landed cost.
              </p>
              <p className="text-[#0E4A7E] dark:text-muted-foreground">
                Please note that this is the "MVP" (Minimum Viable Product) version of a much more sophisticated engine that generates landed costs for all items in an importer's Product Master Data file. As such, this engine is limited to maritime transportation and allows two options for the applicable Incoterms Rule. If you'd like to learn more about the enterprise version of the Total Landed Cost Engine, write to us at contact@tradefacil.com.
              </p>
              <p className="text-[#0E4A7E] dark:text-muted-foreground">
                While TFI is confident in the underlying algorithms, formulas and APIs that enable this engine, it must be stressed that all outputs are intended for informational purposes only and in no way constitute any transportation, duty, legal or U.S. Customs & Border Protection regulatory advice. Integral to the Terms & Conditions for use of this tool, Trade Facilitators, Inc. accepts no liability related to its use.
              </p>
              <p className="text-[#0E4A7E] dark:text-muted-foreground font-medium">
                If you're ready to show your U.S. import program some "Tender Loving Care", please continue below to sign-up for twelve free product classifications…
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0E4A7E] dark:text-foreground mb-4">
              Ready to Calculate Your Total Landed Cost?
            </h2>
            <p className="text-[#0E4A7E] dark:text-muted-foreground mb-6">
              Use our professional platform for accurate landed cost calculations with comprehensive duty analysis.
            </p>
            <Link href="/product-input">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                data-testid="button-cta-start"
              >
                Start Engine
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-[#0E4A7E] dark:text-muted-foreground">
            <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}