import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground font-inter transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border dark:border-border bg-background/50 dark:bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-semibold text-foreground dark:text-foreground">TLC</span>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground hidden sm:inline">Total Landed Costs</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg"
                  data-testid="button-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
                
                <Link href="/signup">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground dark:text-foreground">
                Total Landed Costs
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
                Comprehensive B2B platform for managing and calculating total landed costs with modular precision
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl">
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Modular Design</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    Built with flexibility in mind to adapt to your business needs
                  </p>
                </div>
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl">
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">B2B Focused</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    Purpose-built for business-to-business cost management
                  </p>
                </div>
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl">
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Professional</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    Enterprise-grade platform with modern, intuitive interface
                  </p>
                </div>
              </div>
              
              <Link href="/signup">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg"
                  data-testid="button-start-journey"
                >
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-border dark:border-border bg-background/50 dark:bg-background/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
              <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
