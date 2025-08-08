import { useState } from "react";
import { Moon, Sun, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";
import { CollapsibleSection } from "@/components/forms/collapsible-section";
import { ProductInfoSection } from "@/components/forms/product-info-section";
import type { ProductInfo } from "@shared/schema";

export default function UserInputsPage() {
  const [activeSection, setActiveSection] = useState(1);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleProductInfoSubmit = async (data: ProductInfo) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProductInfo(data);
      setActiveSection(2); // Move to next section (when we add more)
    } catch (error) {
      console.error("Error saving product info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const productInfoSummary = productInfo && (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">Product Name/ID:</span>
        <span className="text-sm text-emerald-300 font-medium">{productInfo.nameId}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">HTS Code:</span>
        <span className="text-sm text-emerald-300 font-medium">{productInfo.htsCode}</span>
      </div>
    </div>
  );

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
              
              <div className="flex items-center space-x-4">
                <Link href="/home">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-slate-300 hover:text-slate-100"
                    data-testid="button-home"
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
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
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 dark:text-slate-100 mb-4">
                Product Cost Calculator
              </h1>
              <p className="text-lg text-slate-400 dark:text-slate-400 max-w-2xl mx-auto">
                Enter your product details to calculate comprehensive landed costs step by step
              </p>
            </div>

            <div className="space-y-6">
              {/* Section 1: Product Information */}
              <CollapsibleSection
                title="Product Information"
                isActive={activeSection === 1}
                isCompleted={!!productInfo}
                onActivate={() => setActiveSection(1)}
                completedSummary={productInfoSummary}
              >
                <ProductInfoSection
                  onSubmit={handleProductInfoSubmit}
                  initialData={productInfo || undefined}
                  isLoading={isLoading}
                />
              </CollapsibleSection>

              {/* Section 2: Coming Soon (Placeholder) */}
              <CollapsibleSection
                title="Shipping Details"
                isActive={activeSection === 2}
                isCompleted={false}
                onActivate={() => setActiveSection(2)}
              >
                <div className="text-center py-8">
                  <p className="text-slate-400 text-lg">
                    This section is coming soon!
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    We'll add shipping cost inputs here next.
                  </p>
                </div>
              </CollapsibleSection>

              {/* Section 3: Coming Soon (Placeholder) */}
              <CollapsibleSection
                title="Additional Costs"
                isActive={activeSection === 3}
                isCompleted={false}
                onActivate={() => setActiveSection(3)}
              >
                <div className="text-center py-8">
                  <p className="text-slate-400 text-lg">
                    This section is coming soon!
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    We'll add additional cost factors here next.
                  </p>
                </div>
              </CollapsibleSection>
            </div>

            {/* Progress Summary */}
            {productInfo && (
              <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Progress Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">1</div>
                    <div className="text-sm text-slate-400">Sections Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">2</div>
                    <div className="text-sm text-slate-400">Sections Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-400">33%</div>
                    <div className="text-sm text-slate-400">Progress</div>
                  </div>
                </div>
              </div>
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
    </div>
  );
}