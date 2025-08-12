import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Check, Moon, Sun, Package, Archive } from "lucide-react";
import mgxLogoPath from "@assets/mgx logo_1754655534840.png";
import wineCasesBg from "@/assets/wine-cases-bg.svg";
import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    {
      id: "shipment-details",
      title: "Shipment Details",
      isCompleted: false,
      isCollapsed: true,
    },
  ]);

  const [showResults, setShowResults] = useState(false);



  const form = useForm<ProductInfo>({
    resolver: zodResolver(productInfoSchema),
    defaultValues: {
      itemNumber: "",
      nameId: "",
      htsCode: "2204.21.50.40",
      countryOfOrigin: "",
      unitCost: 0,
      numberOfWineCases: 0,
      containerSize: "",
      incoterms: "",
      originPort: "",
      destinationPort: "",
      useIndexRates: false,
      freightCost: undefined,
    },
  });

  // Auto-set origin port when country of origin changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "countryOfOrigin") {
        const selectedCountry = value.countryOfOrigin;
        if (selectedCountry) {
          const matchingCountry = countries.find(country => country.code === selectedCountry);
          if (matchingCountry) {
            form.setValue("originPort", matchingCountry.port);
          }
        } else {
          // Clear origin port if no country is selected
          form.setValue("originPort", "");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
    setSections(prev => {
      const currentIndex = prev.findIndex(s => s.id === sectionId);
      const nextIndex = currentIndex + 1;
      
      return prev.map((section, index) => {
        if (section.id === sectionId) {
          // Mark the current section as completed and collapsed
          return { ...section, isCompleted: true, isCollapsed: true };
        } else if (index === nextIndex && nextIndex < prev.length) {
          // Expand the next section after the completed one
          return { ...section, isCollapsed: false };
        }
        return section;
      });
    });
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
      itemNumber: true,
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
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-slate-100 dark:text-slate-100 font-inter transition-colors duration-300 relative">
      {/* Wine Cases Background */}
      <div 
        className="fixed bottom-0 right-0 w-[500px] h-96 opacity-35 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${wineCasesBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
          backgroundSize: 'contain'
        }}
      />
      <div className="min-h-screen flex flex-col relative z-10">
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
              
              {/* MGX Logo in center */}
              <div className="flex-1 flex justify-center">
                <img 
                  src={mgxLogoPath} 
                  alt="MGX Beverage Group" 
                  className="h-10 w-auto"
                />
              </div>
              
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
                      {section.id === "shipment-details" && <Package className="w-5 h-5 text-blue-500" />}
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
                              {/* Item Number Field */}
                              <FormField
                                control={form.control}
                                name="itemNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="itemNumber" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Item Number <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="itemNumber"
                                        type="text"
                                        placeholder="Enter item number"
                                        className="w-full h-[50px] px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        data-testid="input-item-number"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                  </FormItem>
                                )}
                              />

                              {/* Item Name/Description Field */}
                              <FormField
                                control={form.control}
                                name="nameId"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="nameId" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Item Name/Description <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="nameId"
                                        type="text"
                                        placeholder="Enter item name or description"
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
                                      <div className="relative">
                                        <select
                                          {...field}
                                          id="htsCode"
                                          className="w-full h-[50px] px-4 py-0 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-hts-code"
                                        >
                                          <option value="2204.21.50.40" className="bg-slate-700 text-slate-100">
                                            2204.21.50.40
                                          </option>
                                          <option value="2204.10.00.75" className="bg-slate-700 text-slate-100">
                                            2204.10.00.75
                                          </option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
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
                                    form.trigger(['itemNumber', 'nameId', 'htsCode', 'countryOfOrigin', 'unitCost']);
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
                              {/* HTS Code Description */}
                              <div>
                                <Label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                  HTS Code Description
                                </Label>
                                <div className="w-full h-[50px] px-4 py-3 bg-slate-700/30 border border-slate-600/50 !rounded-xl text-slate-400 dark:text-slate-400 flex items-center">
                                  {(() => {
                                    const htsCode = form.watch("htsCode");
                                    const descriptions = {
                                      "2204.21.50.40": "Wine > Red > Not Certified Organic",
                                      "2204.10.00.75": "Wine > Sparkling"
                                    };
                                    return descriptions[htsCode as keyof typeof descriptions] || "Select HTS Code in previous section";
                                  })()}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  This displays the description for the selected HTS Code
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

                      {section.id === "shipment-details" && (
                        <Form {...form}>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Container Size */}
                              <FormField
                                control={form.control}
                                name="containerSize"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="containerSize" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Container Size <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <select
                                          {...field}
                                          id="containerSize"
                                          className="w-full h-[50px] px-4 py-0 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-container-size"
                                        >
                                          <option value="" className="bg-slate-700 text-slate-400">
                                            Select container size
                                          </option>
                                          <option value="40-feet" className="bg-slate-700 text-slate-100">
                                            40 Feet
                                          </option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                  </FormItem>
                                )}
                              />

                              {/* Incoterms */}
                              <FormField
                                control={form.control}
                                name="incoterms"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="incoterms" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Incoterms <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <select
                                          {...field}
                                          id="incoterms"
                                          className="w-full h-[50px] px-4 py-0 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-incoterms"
                                        >
                                          <option value="" className="bg-slate-700 text-slate-400">
                                            Select Incoterms Rule
                                          </option>
                                          <option value="FCA-SUPPLIER" className="bg-slate-700 text-slate-100">
                                            FCA (Supplier Facility)
                                          </option>
                                          <option value="FCA-PORT" className="bg-slate-700 text-slate-100">
                                            FCA (Port of Loading)
                                          </option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      International Commercial Terms for shipping responsibilities
                                    </p>
                                  </FormItem>
                                )}
                              />

                              {/* Origin Port */}
                              <FormField
                                control={form.control}
                                name="originPort"
                                render={({ field }) => {
                                  const selectedCountry = form.watch("countryOfOrigin");
                                  const matchingCountry = countries.find(country => country.code === selectedCountry);
                                  
                                  return (
                                    <FormItem>
                                      <Label htmlFor="originPort" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                        Origin Port <span className="text-red-400">*</span>
                                      </Label>
                                      <FormControl>
                                        <div className="w-full h-[50px] px-4 py-3 bg-slate-700/30 border border-slate-600/50 !rounded-xl text-slate-100 dark:text-slate-100 flex items-center">
                                          {matchingCountry ? matchingCountry.port : (selectedCountry ? "Loading..." : "Select country of origin first")}
                                        </div>
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-sm mt-1" />
                                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                        Port automatically matches selected country of origin
                                      </p>
                                    </FormItem>
                                  );
                                }}
                              />

                              {/* Destination Port */}
                              <FormField
                                control={form.control}
                                name="destinationPort"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label htmlFor="destinationPort" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                      Destination Port <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <select
                                          {...field}
                                          id="destinationPort"
                                          className="w-full h-[50px] px-4 py-0 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-destination-port"
                                        >
                                          <option value="" className="bg-slate-700 text-slate-400">
                                            Select destination port
                                          </option>
                                          <option value="New York (US)" className="bg-slate-700 text-slate-100">
                                            New York (US)
                                          </option>
                                          <option value="New Jersey (US)" className="bg-slate-700 text-slate-100">
                                            New Jersey (US)
                                          </option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Horizontal line and Freight Charges subsection */}
                            <div className="pt-6">
                              <hr className="border-slate-600/50 dark:border-slate-600/50 mb-6" />
                              <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200 mb-6">
                                Freight Charges
                              </h3>
                              
                              <div className="space-y-6">
                                {/* Freight Rate Selection */}
                                <FormField
                                  control={form.control}
                                  name="useIndexRates"
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="space-y-3">
                                        <div 
                                          className="flex items-center space-x-3 cursor-pointer"
                                          onClick={() => field.onChange(true)}
                                        >
                                          <div className="relative">
                                            <input
                                              type="radio"
                                              checked={field.value === true}
                                              onChange={() => field.onChange(true)}
                                              className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500"
                                              data-testid="radio-use-index-rates"
                                            />
                                          </div>
                                          <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 cursor-pointer">
                                            Use Index Rates
                                          </Label>
                                        </div>
                                        <div 
                                          className="flex items-center space-x-3 cursor-pointer"
                                          onClick={() => field.onChange(false)}
                                        >
                                          <div className="relative">
                                            <input
                                              type="radio"
                                              checked={field.value === false}
                                              onChange={() => field.onChange(false)}
                                              className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500"
                                              data-testid="radio-use-my-rate"
                                            />
                                          </div>
                                          <Label className="text-sm font-medium text-slate-300 dark:text-slate-300 cursor-pointer">
                                            Use My Rate
                                          </Label>
                                        </div>
                                      </div>
                                      <FormMessage className="text-red-400 text-sm mt-1" />
                                    </FormItem>
                                  )}
                                />

                                {/* Index Rates Display or Custom Freight Input */}
                                {form.watch("useIndexRates") ? (
                                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
                                    <h4 className="text-sm font-medium text-slate-300 mb-3">Index Rates by Country:</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">France:</span>
                                        <span className="text-slate-100 font-medium">$6,000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Italy:</span>
                                        <span className="text-slate-100 font-medium">$6,100</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Portugal:</span>
                                        <span className="text-slate-100 font-medium">$6,200</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Spain:</span>
                                        <span className="text-slate-100 font-medium">$6,300</span>
                                      </div>
                                    </div>
                                    {(() => {
                                      const countryOfOrigin = form.watch("countryOfOrigin");
                                      const getRateForCountry = (countryCode: string) => {
                                        switch (countryCode) {
                                          case "FR": return 6000;
                                          case "IT": return 6100;
                                          case "PT": return 6200;
                                          case "ES": return 6300;
                                          default: return null;
                                        }
                                      };
                                      const rate = getRateForCountry(countryOfOrigin);
                                      return rate ? (
                                        <div className="mt-3 pt-3 border-t border-slate-600/50">
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-300 font-medium">Selected Rate:</span>
                                            <span className="text-emerald-400 font-bold text-lg">${rate.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      ) : countryOfOrigin ? (
                                        <div className="mt-3 pt-3 border-t border-slate-600/50">
                                          <p className="text-yellow-400 text-sm">No index rate available for selected country</p>
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                ) : (
                                  <FormField
                                    control={form.control}
                                    name="freightCost"
                                    render={({ field }) => (
                                      <FormItem>
                                        <Label htmlFor="freightCost" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                                          Freight Cost (USD) <span className="text-red-400">*</span>
                                        </Label>
                                        <FormControl>
                                          <Input
                                            id="freightCost"
                                            type="number"
                                            placeholder="Enter freight cost"
                                            className="w-full h-[50px] px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 !rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            data-testid="input-freight-cost"
                                            value={field.value || ""}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              field.onChange(value === "" ? undefined : Number(value));
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-sm mt-1" />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end pt-6">
                              <Button
                                type="button"
                                onClick={() => {
                                  // Validate Section 3 fields including freight
                                  const containerSize = form.getValues("containerSize");
                                  const incoterms = form.getValues("incoterms");
                                  const originPort = form.getValues("originPort");
                                  const destinationPort = form.getValues("destinationPort");
                                  const useIndexRates = form.getValues("useIndexRates");
                                  const freightCost = form.getValues("freightCost");
                                  
                                  // Check if freight is properly filled
                                  const freightValid = useIndexRates || (freightCost && freightCost > 0);
                                  
                                  if (containerSize && incoterms && originPort && destinationPort && freightValid) {
                                    markSectionCompleted("shipment-details");
                                    toast({
                                      title: "Success!",
                                      description: "Shipment details saved successfully.",
                                    });
                                  } else {
                                    toast({
                                      title: "Validation Error",
                                      description: "Please fill in all shipment details fields and configure freight charges.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                data-testid="button-save-shipment-details"
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

            {/* Calculate Total Landed Costs Button - Show when all sections are completed */}
            {sections.every(section => section.isCompleted) && (
              <div className="mt-8 text-center">
                <Button
                  type="button"
                  onClick={() => {
                    // Show results and scroll to them
                    setShowResults(true);
                    toast({
                      title: "Calculation Complete",
                      description: "Total Landed Costs results displayed below.",
                    });
                    // Scroll to results after a short delay
                    setTimeout(() => {
                      const resultsElement = document.getElementById('results-section');
                      if (resultsElement) {
                        resultsElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/25"
                  data-testid="button-calculate-tlc"
                >
                  <span className="flex items-center space-x-2">
                    <span>Calculate Total Landed Costs</span>
                  </span>
                </Button>
              </div>
            )}

            {/* Results Section */}
            {showResults && (
              <div id="results-section" className="mt-12 mb-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-100 dark:text-slate-100 mb-2">
                    Total Landed Costs Results
                  </h2>
                  <p className="text-slate-400 dark:text-slate-400">
                    Your calculated costs breakdown
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Box 1 - HERO Box: Item Landed Cost (Full Width) */}
                  <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/30 backdrop-blur-sm rounded-2xl border border-emerald-700/50 p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-emerald-300 mb-4">
                        ITEM LANDED COST
                      </h3>
                      <div className="text-4xl font-bold text-emerald-100 mb-2">
                        {(() => {
                          const numberOfWineCases = form.getValues("numberOfWineCases") || 0;
                          const unitCost = form.getValues("unitCost") || 0;
                          const htsCode = form.getValues("htsCode") || "";
                          const countryOfOrigin = form.getValues("countryOfOrigin") || "";
                          const useIndexRates = form.getValues("useIndexRates");
                          const freightCost = form.getValues("freightCost");
                          
                          // EU Countries for 15% cumulative duty
                          const euCountries = ["FR", "IT", "PT", "ES"];
                          const isEUCountry = euCountries.includes(countryOfOrigin);
                          
                          const customsUnits = numberOfWineCases * 12 * 0.75; // in litres
                          const enteredValue = numberOfWineCases * unitCost; // in USD
                          
                          // Base HTS Code Duty calculation
                          const getBaseHtsDuty = (code: string, liters: number) => {
                            switch (code) {
                              case "2204.21.50.40": return liters * 0.063; // 6.3 cents per liter
                              case "2204.10.00.75": return liters * 0.198; // 19.8 cents per liter
                              default: return 0;
                            }
                          };
                          
                          const baseHtsDutyAmount = getBaseHtsDuty(htsCode, customsUnits);
                          
                          // Chapter 99 Duty calculation (only for EU countries)
                          let chapter99Duty = 0;
                          if (isEUCountry) {
                            const totalDutyAt15Percent = enteredValue * 0.15;
                            chapter99Duty = Math.max(0, totalDutyAt15Percent - baseHtsDutyAmount);
                          }
                          
                          const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Duty;
                          
                          // Freight calculation
                          const getIndexRate = (countryCode: string) => {
                            switch (countryCode) {
                              case "FR": return 6000;
                              case "IT": return 6100;
                              case "PT": return 6200;
                              case "ES": return 6300;
                              default: return 0;
                            }
                          };
                          
                          const totalFreightCosts = useIndexRates ? getIndexRate(countryOfOrigin) : (freightCost || 0);
                          
                          // Total Landed Cost = Unit Cost + (Customs & Duties / Number of Cases) + (Freight / Number of Cases)
                          const customsDutiesPerCase = numberOfWineCases > 0 ? totalCustomsAndDuties / numberOfWineCases : 0;
                          const freightPerCase = numberOfWineCases > 0 ? totalFreightCosts / numberOfWineCases : 0;
                          const itemLandedCost = unitCost + customsDutiesPerCase + freightPerCase;
                          
                          return numberOfWineCases > 0 ? `$${itemLandedCost.toFixed(2)}` : "--";
                        })()}
                      </div>
                      <p className="text-sm text-emerald-400">
                        USD
                      </p>
                    </div>
                  </div>

                  {/* Box 2 - Customs and Duties (Full Width) */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                    <hr className="border-slate-600/50 dark:border-slate-600/50 mb-6" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-6 text-center">
                      CUSTOMS AND DUTIES
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const numberOfWineCases = form.getValues("numberOfWineCases") || 0;
                        const unitCost = form.getValues("unitCost") || 0;
                        const htsCode = form.getValues("htsCode") || "";
                        const countryOfOrigin = form.getValues("countryOfOrigin") || "";
                        
                        // EU Countries for 15% cumulative duty
                        const euCountries = ["FR", "IT", "PT", "ES"];
                        const isEUCountry = euCountries.includes(countryOfOrigin);
                        
                        const customsUnits = numberOfWineCases * 12 * 0.75; // in litres
                        const enteredValue = numberOfWineCases * unitCost; // in USD
                        
                        // Base HTS Code Duty calculation
                        const getBaseHtsDuty = (code: string, liters: number) => {
                          switch (code) {
                            case "2204.21.50.40": return liters * 0.063; // 6.3 cents per liter
                            case "2204.10.00.75": return liters * 0.198; // 19.8 cents per liter
                            default: return 0;
                          }
                        };
                        
                        const baseHtsDutyAmount = getBaseHtsDuty(htsCode, customsUnits);
                        
                        // Chapter 99 Duty calculation (only for EU countries)
                        let chapter99Duty = 0;
                        let chapter99DutyPercentage = 0;
                        if (isEUCountry) {
                          const totalDutyAt15Percent = enteredValue * 0.15;
                          chapter99Duty = Math.max(0, totalDutyAt15Percent - baseHtsDutyAmount);
                          chapter99DutyPercentage = enteredValue > 0 ? (chapter99Duty / enteredValue) * 100 : 0;
                        }
                        
                        const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Duty;
                        const dutyPerItem = numberOfWineCases > 0 ? totalCustomsAndDuties / numberOfWineCases : 0;
                        
                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody>
                                {/* ROW 1 - Unit of Measure */}
                                <tr className="border-b border-slate-600/30">
                                  <td className="py-3 text-slate-400 font-medium">Unit of Measure</td>
                                  <td className="py-3"></td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-slate-100 font-bold text-right">{Math.round(customsUnits)} Liters</td>
                                </tr>
                                
                                {/* ROW 2 - Entered Value */}
                                <tr className="border-b border-slate-600/30">
                                  <td className="py-3 text-slate-400 font-medium">Entered Value</td>
                                  <td className="py-3"></td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-slate-100 font-bold text-right">${enteredValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                
                                {/* ROW 3 - HTS Code Output */}
                                <tr className="border-b border-slate-600/30">
                                  <td className="py-3 font-medium text-[#8997ad]">{htsCode}</td>
                                  <td className="py-3 text-slate-400 font-medium">Base HTS Code Duty</td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-slate-100 font-bold text-right">${baseHtsDutyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                
                                {/* ROW 4 - Chapter 99 Duty (only show for EU countries) */}
                                {isEUCountry && (
                                  <tr className="border-b border-slate-600/30">
                                    <td className="py-3 text-slate-400 font-medium">9903.02.20</td>
                                    <td className="py-3 text-slate-400 font-medium">IEEPA European Union - &lt;15% base duty</td>
                                    <td className="py-3 text-slate-100 font-medium text-right">{chapter99DutyPercentage.toFixed(2)}%</td>
                                    <td className="py-3 text-slate-100 font-bold text-right">${chapter99Duty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  </tr>
                                )}
                                
                                {/* ROW 5 - Total Customs & Duties */}
                                <tr className="border-t-2 border-slate-500">
                                  <td className="py-3 text-slate-300 font-bold">Total Customs & Duties</td>
                                  <td className="py-3"></td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-slate-100 font-bold text-right text-lg">${totalCustomsAndDuties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Highlighted Duty Per Item Section */}
                            <div className="mt-6 pt-6 border-t border-slate-600/50">
                              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-emerald-300 font-bold text-lg">Duty Per Item:</span>
                                  <span className="text-emerald-100 font-bold text-xl">${dutyPerItem.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <p className="text-emerald-400/80 text-sm mt-1">
                                  Total Customs & Duties ÷ Number of Wine Cases
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Box 3 - Freight Costs */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">
                      Freight Costs
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const useIndexRates = form.getValues("useIndexRates");
                        const freightCost = form.getValues("freightCost");
                        const numberOfWineCases = form.getValues("numberOfWineCases") || 0;
                        const countryOfOrigin = form.getValues("countryOfOrigin");
                        
                        // Get index rate based on country
                        const getIndexRate = (countryCode: string) => {
                          switch (countryCode) {
                            case "FR": return 6000;
                            case "IT": return 6100;
                            case "PT": return 6200;
                            case "ES": return 6300;
                            default: return 0;
                          }
                        };
                        
                        const totalFreightCosts = useIndexRates ? getIndexRate(countryOfOrigin) : (freightCost || 0);
                        const freightPerItem = numberOfWineCases > 0 ? totalFreightCosts / numberOfWineCases : 0;
                        
                        // Get country names for display
                        const getCountryName = (code: string) => {
                          const countryNames = {
                            "FR": "France",
                            "IT": "Italy", 
                            "PT": "Portugal",
                            "ES": "Spain"
                          };
                          return countryNames[code as keyof typeof countryNames] || code;
                        };
                        
                        const originCountryName = getCountryName(countryOfOrigin);
                        const destinationCountryName = "United States"; // Based on destination ports
                        
                        return (
                          <>
                            <div className="text-sm text-slate-400 font-bold mb-3">
                              {originCountryName} to {destinationCountryName}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Freight Costs:</span>
                              <span className="text-slate-100 font-medium">${totalFreightCosts.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-slate-600/50 pt-3">
                              <div className="flex justify-between">
                                <span className="text-slate-300 font-medium">Freight per Item:</span>
                                <span className="text-slate-100 font-bold">${freightPerItem.toFixed(2)}</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
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