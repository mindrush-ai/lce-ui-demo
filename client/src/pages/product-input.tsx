import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Check, Moon, Sun, Package, Archive } from "lucide-react";
import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";
import { countries } from "@/lib/countries";
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
    {
      id: "item-details",
      title: "Units and Dimensions",
      isCompleted: false,
      isCollapsed: true,
    },
  ]);



  const form = useForm<ProductInfo>({
    resolver: zodResolver(productInfoSchema),
    defaultValues: {
      nameId: "",
      htsCode: "",
      countryOfOrigin: "",
      unitCost: 0,
      numberOfWineCases: 0,
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



  const validateSection1 = () => {
    const values = form.getValues();
    const section1Schema = productInfoSchema.pick({
      nameId: true,
      htsCode: true,
      countryOfOrigin: true,
      unitCost: true
    });
    
    try {
      section1Schema.parse(values);
      return true;
    } catch (error) {
      return false;
    }
  };

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
                      {section.id === "product-details" && <Package className="w-5 h-5 text-blue-500" />}
                      {section.id === "item-details" && <Archive className="w-5 h-5 text-blue-500" />}
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
                    <div className="p-6 pt-4 overflow-visible" data-testid={`content-${section.id}`}>
                      {section.id === "product-details" && (
                        <Form {...form}>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-visible">
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
                                        className="w-full h-[50px] px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                        className="w-full h-[50px] px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                  <FormItem>
                                    <Label htmlFor="countryOfOrigin" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Country of Origin <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <select
                                          {...field}
                                          id="countryOfOrigin"
                                          className="w-full h-[50px] px-4 py-0 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-country"
                                        >
                                          <option value="" className="bg-slate-700 text-slate-400">
                                            Select country
                                          </option>
                                          {countries.map((country) => (
                                            <option 
                                              key={country.code} 
                                              value={country.code}
                                              className="bg-slate-700 text-slate-100"
                                            >
                                              {country.flag} {country.name} ({country.code})
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
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
                                          className="w-full h-[50px] pl-8 pr-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                type="button"
                                onClick={() => {
                                  if (validateSection1()) {
                                    markSectionCompleted("product-details");
                                    toast({
                                      title: "Success!",
                                      description: "Product information saved successfully.",
                                    });
                                  } else {
                                    // Trigger form validation to show errors
                                    form.trigger(['nameId', 'htsCode', 'countryOfOrigin', 'unitCost']);
                                    toast({
                                      title: "Validation Error",
                                      description: "Please fill in all required fields correctly.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                data-testid="button-save-product"
                              >
                                Save & Continue
                              </Button>
                            </div>
                          </div>
                        </Form>
                      )}

                      {section.id === "item-details" && (
                        <Form {...form}>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Description (Display HTS Code) */}
                              <div>
                                <Label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                  Description
                                </Label>
                                <div className="w-full h-[50px] px-4 py-3 bg-slate-700/30 border border-slate-600/50 !rounded-xl text-slate-400 dark:text-slate-400 flex items-center">
                                  {form.watch("htsCode") || "HTS Code from previous section will appear here"}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  This displays the HTS Code from the previous section
                                </p>
                              </div>

                              {/* Number of Wine Cases */}
                              <FormField
                                control={form.control}
                                name="numberOfWineCases"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="numberOfWineCases" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Number of Wine Cases <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="numberOfWineCases"
                                        type="number"
                                        placeholder="Enter number of cases"
                                        min="1"
                                        max="1260"
                                        step="1"
                                        className="w-full h-[50px] px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        data-testid="input-wine-cases"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 0;
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      Item quantity per container (1-1260, whole numbers only)
                                    </p>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end pt-6">
                              <Button
                                type="button"
                                onClick={() => {
                                  // Validate Section 2 fields
                                  const numberOfWineCases = form.getValues("numberOfWineCases");
                                  if (numberOfWineCases && numberOfWineCases >= 1 && numberOfWineCases <= 1260) {
                                    markSectionCompleted("item-details");
                                    toast({
                                      title: "Success!",
                                      description: "Item details saved successfully.",
                                    });
                                  } else {
                                    toast({
                                      title: "Validation Error",
                                      description: "Please enter a valid number of wine cases (1-1260).",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                data-testid="button-save-item-details"
                              >
                                Save & Continue
                              </Button>
                            </div>
                          </div>
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


    </div>
  );
}