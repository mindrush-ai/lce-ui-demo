import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Check, Moon, Sun } from "lucide-react";
import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";
import { countries, searchCountries } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  isCompleted: boolean;
  isCollapsed: boolean;
}

export default function ProductInputPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [sections, setSections] = useState<Section[]>([
    {
      id: "product-details",
      title: "Product Details",
      isCompleted: false,
      isCollapsed: false,
    },
  ]);

  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const form = useForm<ProductInfo>({
    resolver: zodResolver(productInfoSchema),
    defaultValues: {
      nameId: "",
      htsCode: "",
      countryOfOrigin: "",
      unitCost: 0,
    },
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ));
  };

  const markSectionCompleted = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isCompleted: true, isCollapsed: true }
        : section
    ));
  };

  const formatHtsCode = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as xxxx.xx.xx.xx
    if (limitedDigits.length <= 4) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 4)}.${limitedDigits.slice(4)}`;
    } else if (limitedDigits.length <= 8) {
      return `${limitedDigits.slice(0, 4)}.${limitedDigits.slice(4, 6)}.${limitedDigits.slice(6)}`;
    } else {
      return `${limitedDigits.slice(0, 4)}.${limitedDigits.slice(4, 6)}.${limitedDigits.slice(6, 8)}.${limitedDigits.slice(8)}`;
    }
  };

  const filteredCountries = countrySearch.trim() 
    ? searchCountries(countrySearch.trim()).slice(0, 20)
    : countries.slice(0, 20);

  const selectedCountryCode = form.watch("countryOfOrigin");
  const selectedCountry = countries.find(c => c.code === selectedCountryCode);
  
  // Debug logging
  console.log("Selected country code:", selectedCountryCode);
  console.log("Selected country:", selectedCountry);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit = async (data: ProductInfo) => {
    try {
      console.log("Product data:", data);
      
      markSectionCompleted("product-details");
      
      toast({
        title: "Success!",
        description: "Product information saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-semibold text-slate-100 dark:text-slate-100">TLC</span>
                  <span className="text-sm text-slate-400 dark:text-slate-400 hidden sm:inline">Total Landed Costs</span>
                </div>
              </Link>
              
              <div className="flex items-center space-x-4">
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
                
                <Link href="/home">
                  <Button 
                    variant="outline"
                    data-testid="button-home"
                  >
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-100 dark:text-slate-100 mb-2">
                Product Cost Calculation
              </h1>
              <p className="text-slate-400 dark:text-slate-400">
                Enter your product information to calculate total landed costs
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-slate-800/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 dark:border-slate-700/50"
                  data-testid={`section-${section.id}`}
                >
                  {/* Section Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-6 cursor-pointer transition-colors duration-200",
                      section.isCompleted 
                        ? "bg-emerald-900/30 border-b border-emerald-700/50" 
                        : "hover:bg-slate-700/30"
                    )}
                    onClick={() => toggleSection(section.id)}
                    data-testid={`button-toggle-${section.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      {section.isCompleted ? (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-slate-500 rounded-full" />
                      )}
                      <h2 className="text-xl font-semibold text-slate-100 dark:text-slate-100">
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {section.isCompleted && (
                        <span className="text-sm text-emerald-400 font-medium">Completed</span>
                      )}
                      {section.isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Section Content */}
                  {!section.isCollapsed && (
                    <div className="p-6 pt-0 overflow-visible" data-testid={`content-${section.id}`}>
                      {section.id === "product-details" && (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                              {/* Name/ID Field */}
                              <FormField
                                control={form.control}
                                name="nameId"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="nameId" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Product Name/ID <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="nameId"
                                        type="text"
                                        placeholder="Enter product name or ID"
                                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        data-testid="input-name-id"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                  </FormItem>
                                )}
                              />

                              {/* HTS Code Field */}
                              <FormField
                                control={form.control}
                                name="htsCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="htsCode" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      HTS Code <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="htsCode"
                                        type="text"
                                        placeholder="xxxx.xx.xx.xx"
                                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        data-testid="input-hts-code"
                                        value={field.value}
                                        onChange={(e) => {
                                          const formatted = formatHtsCode(e.target.value);
                                          field.onChange(formatted);
                                        }}
                                        maxLength={13} // xxxx.xx.xx.xx = 13 characters
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      10-digit harmonized tariff schedule code (first digit cannot be 0)
                                    </p>
                                  </FormItem>
                                )}
                              />

                              {/* Country of Origin Field */}
                              <FormField
                                control={form.control}
                                name="countryOfOrigin"
                                render={({ field }) => (
                                  <FormItem className="relative">
                                    <Label htmlFor="countryOfOrigin" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Country of Origin <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <div 
                                          className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 cursor-pointer flex items-center justify-between focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200"
                                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                          data-testid="select-country"
                                        >
                                          <div className="flex items-center space-x-2">
                                            {selectedCountry ? (
                                              <>
                                                <span className="text-xl">{selectedCountry.flag}</span>
                                                <span>{selectedCountry.name}</span>
                                                <span className="text-slate-400 text-sm">({selectedCountry.code})</span>
                                              </>
                                            ) : (
                                              <span className="text-slate-400">Select country</span>
                                            )}
                                          </div>
                                          <ChevronDown className={cn(
                                            "w-5 h-5 text-slate-400 transition-transform duration-200",
                                            showCountryDropdown && "rotate-180"
                                          )} />
                                        </div>
                                        
                                        {showCountryDropdown && (
                                          <div 
                                            ref={countryDropdownRef}
                                            className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-2xl z-[9999] max-h-80 overflow-hidden" 
                                            style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}
                                          >
                                            <div className="p-3 border-b border-slate-600">
                                              <Input
                                                type="text"
                                                placeholder="Search countries..."
                                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={countrySearch}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  setCountrySearch(e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => {
                                                  e.stopPropagation();
                                                  if (e.key === 'Escape') {
                                                    setShowCountryDropdown(false);
                                                    setCountrySearch("");
                                                  }
                                                }}
                                                autoFocus
                                                data-testid="input-country-search"
                                              />
                                            </div>
                                            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
                                              {filteredCountries.length === 0 ? (
                                                <div className="px-4 py-3 text-slate-400 text-center">
                                                  No countries found
                                                </div>
                                              ) : (
                                                filteredCountries.map((country) => (
                                                  <div
                                                    key={country.code}
                                                    className="px-4 py-3 hover:bg-slate-600 cursor-pointer flex items-center space-x-3 transition-colors duration-200"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      console.log("Selecting country:", country.code, country.name);
                                                      field.onChange(country.code);
                                                      setShowCountryDropdown(false);
                                                      setCountrySearch("");
                                                    }}
                                                    data-testid={`option-country-${country.code}`}
                                                  >
                                                    <span className="text-xl flex-shrink-0">{country.flag}</span>
                                                    <span className="text-slate-100 flex-1">{country.name}</span>
                                                    <span className="text-slate-400 text-sm flex-shrink-0">({country.code})</span>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                  </FormItem>
                                )}
                              />

                              {/* Unit Cost Field */}
                              <FormField
                                control={form.control}
                                name="unitCost"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="unitCost" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Unit Cost (USD) <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">$</span>
                                        <Input
                                          id="unitCost"
                                          type="number"
                                          placeholder="0.0000"
                                          step="0.0001"
                                          min="0"
                                          max="999999.9999"
                                          className="w-full pl-8 pr-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                          data-testid="input-unit-cost"
                                          value={field.value || ''}
                                          onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            field.onChange(value);
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      Up to 4 decimal places allowed
                                    </p>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end pt-6">
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                data-testid="button-save-product"
                              >
                                Save & Continue
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </div>
                  )}
                </div>
              ))}
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

      {/* Click outside to close country dropdown */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCountryDropdown(false);
            setCountrySearch("");
          }}
        />
      )}
    </div>
  );
}