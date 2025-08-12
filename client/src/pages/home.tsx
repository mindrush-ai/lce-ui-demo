import { Moon, Sun, LogOut, Calculator, TrendingUp, FileText, Package, BarChart3, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logout clicked");
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
                <span className="text-sm text-muted-foreground dark:text-muted-foreground hidden sm:inline">Total Landed Costs BETA - Customer Name</span>
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground dark:text-foreground">Welcome - MGX Team</h1>
              <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
                Your Total Landed Costs dashboard is ready. Start managing your business costs with precision.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <Link href="/product-input">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-lg"
                    data-testid="button-start-calculation"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Start Cost Calculation
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <Calculator className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Cost Calculator</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Calculate comprehensive landed costs for your products
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-cost-calculator">
                    Coming Soon
                  </Button>
                </div>
                
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <Package className="w-8 h-8 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Inventory Management</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Track and manage your inventory with cost insights
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-inventory">
                    Coming Soon
                  </Button>
                </div>
                
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <BarChart3 className="w-8 h-8 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Visualize cost trends and business insights
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-analytics">
                    Coming Soon
                  </Button>
                </div>
                
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <Users className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Supplier Management</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Manage supplier relationships and costs
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-suppliers">
                    Coming Soon
                  </Button>
                </div>
                
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <FileText className="w-8 h-8 text-cyan-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Reporting Suite</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Generate comprehensive cost reports
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-reports">
                    Coming Soon
                  </Button>
                </div>
                
                <div className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground dark:text-card-foreground mb-2">Integration Hub</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                    Connect with your existing business tools
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-integrations">
                    Coming Soon
                  </Button>
                </div>
              </div>
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
