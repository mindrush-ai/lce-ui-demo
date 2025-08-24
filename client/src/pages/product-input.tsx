import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Check, Moon, Sun, Package, Archive, LogOut, AlertTriangle, XCircle } from "lucide-react";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";

import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";
import { countries } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

// System Variables - Hardcoded for this version
const CONTAINER_UTILIZATION = 0.90;

// Container Volumes in cubic meters
const CONTAINER_VOLUMES = {
  "20-feet": 30,
  "40-feet": 60,
  "40-feet-high-cube": 70,
  "45-feet": 80
} as const;

interface Section {
  id: string;
  title: string;
  isCompleted: boolean;
  isCollapsed: boolean;
  hasValidationErrors?: boolean;
  missingFields?: string[];
}

export default function ProductInputPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

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
      htsCode: "",
      countryOfOrigin: "",
      unitCost: 0,
      masterPackLength: 0,
      masterPackWidth: 0,
      masterPackHeight: 0,
      masterPackWeight: 0,
      itemsPerMasterPack: 0,
      containerSize: "",
      incoterms: "",
      originPort: "",
      destinationPort: "",
      freightCost: 0,
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

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      
      // Invalidate auth queries to refresh authentication state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to login page (force a full page reload to ensure clean state)
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
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

  const getSectionValidationErrors = (sectionId: string) => {
    const values = form.getValues();
    const missingFields: string[] = [];
    
    switch (sectionId) {
      case 'product-details':
        if (!values.itemNumber || values.itemNumber.trim() === '') missingFields.push('Item Number');
        if (!values.nameId || values.nameId.trim() === '') missingFields.push('Item Name/Description');
        if (!values.htsCode) missingFields.push('HTS Code');
        if (!values.countryOfOrigin) missingFields.push('Country of Origin');
        if (!values.unitCost || values.unitCost <= 0) missingFields.push('Unit Cost');
        break;
      case 'item-details':
        if (!values.masterPackLength || values.masterPackLength <= 0) missingFields.push('Master Pack Length');
        if (!values.masterPackWidth || values.masterPackWidth <= 0) missingFields.push('Master Pack Width');
        if (!values.masterPackHeight || values.masterPackHeight <= 0) missingFields.push('Master Pack Height');
        if (!values.masterPackWeight || values.masterPackWeight <= 0) missingFields.push('Master Pack Weight');
        if (!values.itemsPerMasterPack || values.itemsPerMasterPack <= 0) missingFields.push('Items per Master Pack');
        break;
      case 'shipment-details':
        if (!values.containerSize) missingFields.push('Container Size');
        if (!values.incoterms) missingFields.push('Incoterms');
        if (!values.originPort) missingFields.push('Origin Port');
        if (!values.destinationPort) missingFields.push('Destination Port');
        if (!values.freightCost || values.freightCost <= 0) missingFields.push('Freight Cost');
        break;
    }
    
    return missingFields;
  };

  const updateSectionValidationState = (sectionId: string) => {
    const missingFields = getSectionValidationErrors(sectionId);
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            hasValidationErrors: missingFields.length > 0,
            missingFields 
          }
        : section
    ));
    return missingFields.length === 0;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-[#0E4A7E] dark:text-slate-100 font-inter transition-colors duration-300 relative">
      <div className="min-h-screen flex flex-col relative z-10">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              {/* Left Side - Brand Text */}
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <span className="text-2xl font-semibold text-[#0E4A7E]">TLC</span>
                  <span className="text-lg text-[#0E4A7E] hidden sm:inline">Total Landed Cost Engine</span>
                </div>
              </Link>
              
              {/* Center - Logo Only (Larger) */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img 
                  src={tfiLogoPath} 
                  alt="TFI Logo" 
                  className="h-24 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
                />
              </div>
              
              {/* Right Side - Actions */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200 group"
                  data-testid="button-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  ) : (
                    <Moon className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-200" />
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">US Landed Cost Engine</h1>
              <p className="text-[#0E4A7E] dark:text-slate-400">Enter your product information to calculate total landed cost</p>
            </div>

            <div className="space-y-6">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={cn(
                    "backdrop-blur-sm rounded-2xl transition-all duration-300",
                    section.hasValidationErrors
                      ? "bg-red-50 dark:bg-red-900/20 border border-slate-300/50 dark:border-slate-700/50 border-l-4 border-l-red-500"
                      : "bg-white/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50"
                  )}
                  data-testid={`section-${section.id}`}
                >
                  {/* Section Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-6 cursor-pointer transition-colors duration-200",
                      section.isCompleted 
                        ? "bg-primary/10 dark:bg-primary/20" 
                        : "hover:bg-slate-100/30 dark:hover:bg-slate-700/30"
                    )}
                    onClick={() => toggleSection(section.id)}
                    data-testid={`button-toggle-${section.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      {section.id === "product-details" && <Package className="w-5 h-5 text-blue-500" />}
                      {section.id === "item-details" && <Archive className="w-5 h-5 text-blue-500" />}
                      {section.id === "shipment-details" && <Package className="w-5 h-5 text-blue-500" />}
                      <h2 className="text-xl font-semibold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {section.isCompleted && !section.hasValidationErrors && (
                        <span className="text-sm text-primary font-medium">Completed</span>
                      )}
                      {section.isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#0E4A7E] dark:text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {section.hasValidationErrors && section.missingFields && section.missingFields.length > 0 && (
                    <div className="px-6 pb-2">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Please complete: {section.missingFields.join(", ")}
                      </p>
                    </div>
                  )}

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
                                    <Label htmlFor="itemNumber" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Item Number <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="itemNumber"
                                        type="text"
                                        placeholder="Enter item number"
                                        className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                    <Label htmlFor="nameId" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Item Name/Description <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <Input
                                        id="nameId"
                                        type="text"
                                        placeholder="Enter item name or description"
                                        className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                    <Label htmlFor="htsCode" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      HTS Code <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative z-20">
                                        <select
                                          {...field}
                                          id="htsCode"
                                          className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-hts-code"
                                        >
                                          <option value="" className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            Select HTS Code
                                          </option>
                                          <option value="3401.19.00.00" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            3401.19.00.00
                                          </option>
                                          <option value="5603.92.00.70" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            5603.92.00.70
                                          </option>
                                          <option value="3401.11.50.00" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            3401.11.50.00
                                          </option>
                                          <option value="5603.12.00.10" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            5603.12.00.10
                                          </option>
                                          <option value="5603.14.90.10" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            5603.14.90.10
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
                                    <Label htmlFor="countryOfOrigin" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Country of Origin <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative z-20">
                                        <select
                                          {...field}
                                          id="countryOfOrigin"
                                          className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-country"
                                        >
                                          <option value="" className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            Select country
                                          </option>
                                          {countries.map((country) => (
                                            <option 
                                              key={country.code} 
                                              value={country.code}
                                              className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100"
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
                                    <Label htmlFor="unitCost" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
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
                                          className="w-full h-[50px] pl-8 pr-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                    <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
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
                                  const isValid = updateSectionValidationState("product-details");
                                  if (isValid) {
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
                            <div className="grid grid-cols-1 gap-6">
                              {/* HTS Code Description */}
                              <div>
                                <Label className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                  HTS Code Description
                                </Label>
                                <div className="w-full h-[50px] px-4 py-3 bg-slate-100 dark:bg-slate-700/30 border border-slate-300 dark:border-slate-600/50 !rounded-xl text-[#0E4A7E] dark:text-slate-400 flex items-center">
                                  {(() => {
                                    const htsCode = form.watch("htsCode");
                                    const descriptions = {
                                      "3401.19.00.00": "Baby Wipes & Flushable Wipes",
                                      "5603.92.00.70": "Dry Wipes",
                                      "3401.11.50.00": "Benefit Wipes & Makeup Wipes",
                                      "5603.12.00.10": "Sanitizing Wipes",
                                      "5603.14.90.10": "Sanitizing Wipes"
                                    };
                                    return descriptions[htsCode as keyof typeof descriptions] || "Select HTS Code in previous section";
                                  })()}
                                </div>
                                <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
                                  This displays the description for the selected HTS Code
                                </p>
                              </div>

                            </div>

                            {/* Master Pack Section */}
                            <div className="pt-6">
                              <hr className="border-slate-300 dark:border-slate-600/50 mb-6" />
                              <h3 className="text-lg font-semibold text-foreground mb-6">
                                Master Pack
                              </h3>
                              
                              <div className="space-y-6">
                                {/* Master Pack Dimensions */}
                                <div>
                                  <Label className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                    Master Pack Dimensions (cm) <span className="text-red-400">*</span>
                                  </Label>
                                  <div className="grid grid-cols-3 gap-3">
                                    <FormField
                                      control={form.control}
                                      name="masterPackLength"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className="relative">
                                              <Input
                                                type="number"
                                                placeholder="Length"
                                                step="0.1"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const value = parseFloat(e.target.value) || 0;
                                                  field.onChange(value);
                                                }}
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">L</span>
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="masterPackWidth"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className="relative">
                                              <Input
                                                type="number"
                                                placeholder="Width"
                                                step="0.1"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const value = parseFloat(e.target.value) || 0;
                                                  field.onChange(value);
                                                }}
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">W</span>
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="masterPackHeight"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className="relative">
                                              <Input
                                                type="number"
                                                placeholder="Height"
                                                step="0.1"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const value = parseFloat(e.target.value) || 0;
                                                  field.onChange(value);
                                                }}
                                              />
                                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">H</span>
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
                                    Enter dimensions in centimeters (Length x Width x Height)
                                  </p>
                                </div>

                                {/* Master Pack Weight and Items per Master Pack */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <FormField
                                    control={form.control}
                                    name="masterPackWeight"
                                    render={({ field }) => (
                                      <FormItem>
                                        <Label htmlFor="masterPackWeight" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                          Master Pack Weight (kg) <span className="text-red-400">*</span>
                                        </Label>
                                        <FormControl>
                                          <Input
                                            id="masterPackWeight"
                                            type="number"
                                            placeholder="Enter weight in kg"
                                            step="0.1"
                                            min="0"
                                            className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={field.value || ''}
                                            onChange={(e) => {
                                              const value = parseFloat(e.target.value) || 0;
                                              field.onChange(value);
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-sm mt-1" />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="itemsPerMasterPack"
                                    render={({ field }) => (
                                      <FormItem>
                                        <Label htmlFor="itemsPerMasterPack" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                          Items per Master Pack <span className="text-red-400">*</span>
                                        </Label>
                                        <FormControl>
                                          <Input
                                            id="itemsPerMasterPack"
                                            type="number"
                                            placeholder="Enter number of items"
                                            min="1"
                                            step="1"
                                            className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={field.value || ''}
                                            onChange={(e) => {
                                              const value = parseInt(e.target.value) || 0;
                                              field.onChange(value);
                                            }}
                                          />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-sm mt-1" />
                                        <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
                                          Whole numbers only (1 and above)
                                        </p>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end pt-6">
                              <Button
                                type="button"
                                onClick={() => {
                                  const isValid = updateSectionValidationState("item-details");
                                  if (isValid) {
                                    markSectionCompleted("item-details");
                                    toast({
                                      title: "Success!",
                                      description: "Units and dimensions saved successfully.",
                                    });
                                  } else {
                                    toast({
                                      title: "Validation Error",
                                      description: "Please fill in all required fields for units and master pack dimensions.",
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
                                    <Label htmlFor="containerSize" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Container Size <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative z-20">
                                        <select
                                          {...field}
                                          id="containerSize"
                                          className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-container-size"
                                        >
                                          <option value="" className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            Select container size
                                          </option>
                                          <option value="20-feet" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            20 Feet
                                          </option>
                                          <option value="40-feet" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            40 Feet
                                          </option>
                                          <option value="40-feet-high-cube" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            40 Feet High Cube
                                          </option>
                                          <option value="45-feet" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            45 Feet
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
                                    <Label htmlFor="incoterms" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Incoterms Rule <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative z-20">
                                        <select
                                          {...field}
                                          id="incoterms"
                                          className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-incoterms"
                                        >
                                          <option value="" className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            Select Incoterms Rule
                                          </option>
                                          <option value="FCA-SUPPLIER" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            FCA (Supplier Facility)
                                          </option>
                                          <option value="FCA-PORT" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            FCA (Port of Loading)
                                          </option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-sm mt-1" />
                                    <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
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
                                      <Label htmlFor="originPort" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                        Origin Port <span className="text-red-400">*</span>
                                      </Label>
                                      <FormControl>
                                        <div className="w-full h-[50px] px-4 py-3 bg-slate-100 dark:bg-slate-700/30 border border-slate-300 dark:border-slate-600/50 !rounded-xl text-[#0E4A7E] dark:text-slate-400 flex items-center">
                                          {matchingCountry ? matchingCountry.port : (selectedCountry ? "Loading..." : "Select country of origin first")}
                                        </div>
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-sm mt-1" />
                                      <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
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
                                    <Label htmlFor="destinationPort" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                      Destination Port <span className="text-red-400">*</span>
                                    </Label>
                                    <FormControl>
                                      <div className="relative z-20">
                                        <select
                                          {...field}
                                          id="destinationPort"
                                          className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none pr-12"
                                          data-testid="select-destination-port"
                                        >
                                          <option value="" className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            Select destination port
                                          </option>
                                          <option value="Long Beach (US)" className="bg-white dark:bg-slate-700 text-[#0E4A7E] dark:text-slate-100">
                                            Long Beach (US)
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
                              <hr className="border-slate-300 dark:border-slate-600/50 mb-6" />
                              <h3 className="text-lg font-semibold text-foreground mb-6">
                                Freight Charges
                              </h3>
                              
                              <div className="space-y-6">
                                {/* Direct Freight Cost Input */}
                                <FormField
                                  control={form.control}
                                  name="freightCost"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Label htmlFor="freightCost" className="block text-sm font-medium text-[#0E4A7E] dark:text-slate-300 mb-2">
                                        Freight Cost (USD) <span className="text-red-400">*</span>
                                      </Label>
                                      <FormControl>
                                        <div className="relative">
                                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">$</span>
                                          <Input
                                            id="freightCost"
                                            type="number"
                                            placeholder="Enter freight cost"
                                            min="0"
                                            step="0.01"
                                            className="w-full h-[50px] pl-8 pr-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            data-testid="input-freight-cost"
                                            value={field.value || ""}
                                            onChange={(e) => {
                                              const value = parseFloat(e.target.value) || 0;
                                              field.onChange(value);
                                            }}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-sm mt-1" />
                                      <p className="text-xs text-[#0E4A7E] dark:text-slate-500 mt-1">
                                        Enter your negotiated freight rate
                                      </p>
                                    </FormItem>
                                  )}
                                />

                              </div>
                            </div>

                            <div className="flex justify-end pt-6">
                              <Button
                                type="button"
                                onClick={() => {
                                  const isValid = updateSectionValidationState("shipment-details");
                                  if (isValid) {
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
                  className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-white font-bold text-lg py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-primary/25"
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Total Landed Cost</h2>
                  <p className="text-[#0E4A7E] dark:text-slate-400">Your calculated cost breakdown</p>
                </div>

                <div className="space-y-6">
                  {/* Box 1 - HERO Box: Item Landed Cost (Full Width) */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 backdrop-blur-sm rounded-2xl border border-primary/30 dark:border-primary/50 p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-4">ITEM LANDED COST (PER UNIT)</h3>
                      <div className="text-4xl font-bold text-primary dark:text-primary/90 mb-2">
                        {(() => {
                          const unitCost = form.getValues("unitCost") || 0;
                          const htsCode = form.getValues("htsCode") || "";
                          const countryOfOrigin = form.getValues("countryOfOrigin") || "";
                          const freightCost = form.getValues("freightCost") || 0;
                          const containerSize = form.getValues("containerSize") as keyof typeof CONTAINER_VOLUMES || "";
                          const masterPackLength = form.getValues("masterPackLength") || 0;
                          const masterPackWidth = form.getValues("masterPackWidth") || 0;
                          const masterPackHeight = form.getValues("masterPackHeight") || 0;
                          const itemsPerMasterPack = form.getValues("itemsPerMasterPack") || 0;
                          
                          // Container and capacity calculations
                          const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize] || 0;
                          const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                          const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                          const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000; // Convert cm³ to m³
                          const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                          const maxItemsPerContainer = maxMasterPacksPerContainer * itemsPerMasterPack;
                          
                          // Use maximum container capacity as the number of units
                          const numberOfUnits = maxItemsPerContainer;
                          
                          // China for wipes duty calculations
                          const isChinaCountry = countryOfOrigin === "CN";
                          
                          const enteredValue = numberOfUnits * unitCost; // in USD
                          
                          // Base HTS Code Duty calculation (all wipes are duty-free)
                          const getBaseHtsDuty = (code: string, value: number) => {
                            const validCodes = ["3401.19.00.00", "5603.92.00.70", "3401.11.50.00", "5603.12.00.10", "5603.14.90.10"];
                            return validCodes.includes(code) ? 0 : 0; // All wipes are duty-free
                          };
                          
                          const baseHtsDutyAmount = getBaseHtsDuty(htsCode, enteredValue);
                          
                          // Chapter 99 Duty calculation (only for China)
                          let chapter99Duty = 0;
                          if (isChinaCountry) {
                            const getChapter99Rate = (code: string) => {
                              switch (code) {
                                case "3401.19.00.00": return 0.20 + 0.10 + 0.075; // 37.5%
                                case "5603.92.00.70": return 0.20 + 0.10 + 0.25; // 55%
                                case "3401.11.50.00": return 0.20 + 0.10 + 0.25; // 55%
                                case "5603.12.00.10": return 0.20 + 0.10 + 0.25; // 55%
                                case "5603.14.90.10": return 0.20 + 0.10 + 0.25; // 55%
                                default: return 0;
                              }
                            };
                            chapter99Duty = enteredValue * getChapter99Rate(htsCode);
                          }
                          
                          const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Duty;
                          
                          // Use the entered freight cost directly
                          const totalFreightCosts = freightCost;
                          
                          // Total Landed Cost = Unit Cost + (Customs & Duties / Number of Units) + (Freight / Number of Units)
                          const customsDutiesPerUnit = numberOfUnits > 0 ? totalCustomsAndDuties / numberOfUnits : 0;
                          const freightPerUnit = numberOfUnits > 0 ? totalFreightCosts / numberOfUnits : 0;
                          const itemLandedCost = unitCost + customsDutiesPerUnit + freightPerUnit;
                          
                          return numberOfUnits > 0 ? `$${itemLandedCost.toFixed(2)}` : "--";
                        })()}
                      </div>
                      
                    </div>
                  </div>

                  {/* Box 2 - Customs and Duties (Full Width) */}
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6">
                    <h3 className="font-semibold text-foreground mb-6 text-center text-[20px]">DUTIES</h3>
                    <hr className="border-slate-300/50 dark:border-slate-600/50 mb-6" />
                    <div className="space-y-4">
                      {(() => {
                        const unitCost = form.getValues("unitCost") || 0;
                        const htsCode = form.getValues("htsCode") || "";
                        const countryOfOrigin = form.getValues("countryOfOrigin") || "";
                        const containerSize = form.getValues("containerSize") as keyof typeof CONTAINER_VOLUMES || "";
                        const masterPackLength = form.getValues("masterPackLength") || 0;
                        const masterPackWidth = form.getValues("masterPackWidth") || 0;
                        const masterPackHeight = form.getValues("masterPackHeight") || 0;
                        const itemsPerMasterPack = form.getValues("itemsPerMasterPack") || 0;
                        
                        // Calculate maximum units that fit in container
                        const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize] || 0;
                        const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                        const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                        const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000;
                        const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                        const numberOfUnits = maxMasterPacksPerContainer * itemsPerMasterPack;
                        
                        // China for wipes duty calculations
                        const isChinaCountry = countryOfOrigin === "CN";
                        
                        const enteredValue = numberOfUnits * unitCost; // in USD
                        
                        // Base HTS Code Duty calculation (all wipes are duty-free)
                        const getBaseHtsDuty = (code: string, value: number) => {
                          const validCodes = ["3401.19.00.00", "5603.92.00.70", "3401.11.50.00", "5603.12.00.10", "5603.14.90.10"];
                          return validCodes.includes(code) ? 0 : 0; // All wipes are duty-free
                        };
                        
                        const baseHtsDutyAmount = getBaseHtsDuty(htsCode, enteredValue);
                        
                        // Chapter 99 Duty calculation for China
                        const getChapter99Codes = (htsCode: string) => {
                          switch (htsCode) {
                            case "3401.19.00.00": 
                              return [
                                { code: "9903.88.03", description: "Baby Wipes & Flushable Wipes - Section 301 Duty", percentage: 20.0 },
                                { code: "9903.88.15", description: "Baby Wipes & Flushable Wipes - Additional Tariff", percentage: 10.0 },
                                { code: "9903.89.05", description: "Baby Wipes & Flushable Wipes - Trade Action Duty", percentage: 7.5 }
                              ];
                            case "5603.92.00.70":
                              return [
                                { code: "9903.88.03", description: "Dry Wipes - Section 301 Duty", percentage: 20.0 },
                                { code: "9903.88.15", description: "Dry Wipes - Additional Tariff", percentage: 10.0 },
                                { code: "9903.89.06", description: "Dry Wipes - Trade Action Duty", percentage: 25.0 }
                              ];
                            case "3401.11.50.00":
                              return [
                                { code: "9903.88.03", description: "Benefit Wipes & Makeup Wipes - Section 301 Duty", percentage: 20.0 },
                                { code: "9903.88.15", description: "Benefit Wipes & Makeup Wipes - Additional Tariff", percentage: 10.0 },
                                { code: "9903.89.07", description: "Benefit Wipes & Makeup Wipes - Trade Action Duty", percentage: 25.0 }
                              ];
                            case "5603.12.00.10":
                              return [
                                { code: "9903.88.03", description: "Sanitizing Wipes - Section 301 Duty", percentage: 20.0 },
                                { code: "9903.88.15", description: "Sanitizing Wipes - Additional Tariff", percentage: 10.0 },
                                { code: "9903.89.08", description: "Sanitizing Wipes - Trade Action Duty", percentage: 25.0 }
                              ];
                            case "5603.14.90.10":
                              return [
                                { code: "9903.88.03", description: "Sanitizing Wipes - Section 301 Duty", percentage: 20.0 },
                                { code: "9903.88.15", description: "Sanitizing Wipes - Additional Tariff", percentage: 10.0 },
                                { code: "9903.89.09", description: "Sanitizing Wipes - Trade Action Duty", percentage: 25.0 }
                              ];
                            default: 
                              return [];
                          }
                        };
                        
                        const chapter99Codes = isChinaCountry ? getChapter99Codes(htsCode) : [];
                        let totalChapter99Duty = 0;
                        
                        if (isChinaCountry) {
                          chapter99Codes.forEach(item => {
                            totalChapter99Duty += enteredValue * (item.percentage / 100);
                          });
                        }
                        
                        const totalCustomsAndDuties = baseHtsDutyAmount + totalChapter99Duty;
                        
                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <tbody>
                                {/* ROW 1 - Number of Units */}
                                <tr className="border-b border-slate-300 dark:border-slate-600/30">
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Number of Units</td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Units</td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">{numberOfUnits}</td>
                                </tr>
                                
                                {/* ROW 2 - Entered Value */}
                                <tr className="border-b border-slate-300 dark:border-slate-600/30">
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Entered Value</td>
                                  <td className="py-3"></td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${enteredValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                
                                {/* ROW 3 - HTS Code Duty */}
                                <tr className="border-b border-slate-300 dark:border-slate-600/30">
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{htsCode}</td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Base HTS Code Duty</td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Free</td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${baseHtsDutyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                
                                {/* ROW 4-6 - Chapter 99 Duty (Line Items 1-3) for China */}
                                {isChinaCountry && chapter99Codes.map((item, index) => (
                                  <tr key={index} className="border-b border-slate-300 dark:border-slate-600/30">
                                    <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.code}</td>
                                    <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.description}</td>
                                    <td className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.percentage.toFixed(1)}%</td>
                                    <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${(enteredValue * (item.percentage / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                                
                                {/* ROW 7 - Total */}
                                <tr className="border-t-2 border-slate-400 dark:border-slate-500">
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-lg">Total Duties</td>
                                  <td className="py-3"></td>
                                  <td className="py-3"></td>
                                  <td className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right text-lg">${totalCustomsAndDuties.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                              </tbody>
                            </table>
                            {/* Highlighted Duty Per Item Section */}
                            <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600/50">
                              <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-primary dark:text-primary/80 font-bold text-lg">Duty Per Item (Case)</span>
                                  <span className="text-primary dark:text-primary/90 font-bold text-xl">${numberOfUnits > 0 ? (totalCustomsAndDuties / numberOfUnits).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                                </div>
                                
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Box 3 - Freight Costs */}
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-[20px] text-center">FREIGHT COSTS</h3>
                    <div className="space-y-4">
                      {(() => {
                        const freightCost = form.getValues("freightCost") || 0;
                        const countryOfOrigin = form.getValues("countryOfOrigin");
                        const containerSize = form.getValues("containerSize") as keyof typeof CONTAINER_VOLUMES || "";
                        const masterPackLength = form.getValues("masterPackLength") || 0;
                        const masterPackWidth = form.getValues("masterPackWidth") || 0;
                        const masterPackHeight = form.getValues("masterPackHeight") || 0;
                        const itemsPerMasterPack = form.getValues("itemsPerMasterPack") || 0;
                        
                        // Calculate maximum units that fit in container
                        const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize] || 0;
                        const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                        const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                        const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000;
                        const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                        const numberOfUnits = maxMasterPacksPerContainer * itemsPerMasterPack;
                        
                        // Use the entered freight cost directly
                        const totalFreightCosts = freightCost;
                        const freightPerItem = numberOfUnits > 0 ? totalFreightCosts / numberOfUnits : 0;
                        
                        // Get country names for display
                        const getCountryName = (code: string) => {
                          const countryNames = {
                            "CN": "China"
                          };
                          return countryNames[code as keyof typeof countryNames] || code;
                        };
                        
                        const originCountryName = getCountryName(countryOfOrigin);
                        const destinationCountryName = "United States"; // Based on destination ports
                        
                        return (
                          <>
                            <div className="text-sm text-[#0E4A7E] dark:text-slate-400 font-bold mb-3">
                              {originCountryName} to {destinationCountryName}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#0E4A7E] dark:text-slate-400">Total Freight Costs</span>
                              <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">${totalFreightCosts.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-slate-300 dark:border-slate-600/50 pt-3">
                              <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-primary dark:text-primary/80 font-bold text-lg">Freight Per Item</span>
                                  <span className="text-primary dark:text-primary/90 font-bold text-xl">${freightPerItem.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Box 4 - Container Utilization */}
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-[20px] text-center">CONTAINER UTILIZATION</h3>
                    <div className="space-y-4">
                      {(() => {
                        const containerSize = form.getValues("containerSize") as keyof typeof CONTAINER_VOLUMES || "";
                        const masterPackLength = form.getValues("masterPackLength") || 0;
                        const masterPackWidth = form.getValues("masterPackWidth") || 0;
                        const masterPackHeight = form.getValues("masterPackHeight") || 0;
                        const itemsPerMasterPack = form.getValues("itemsPerMasterPack") || 0;
                        
                        // Container calculations
                        const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize] || 0;
                        const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                        const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                        const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000; // Convert cm³ to m³
                        const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                        const maxItemsPerContainer = maxMasterPacksPerContainer * itemsPerMasterPack;
                        const masterPacksUsed = maxMasterPacksPerContainer; // Use all available space
                        const volumeUtilizedByShipment = masterPacksUsed * masterPackVolumeCubicMeters;
                        const utilizationPercentage = usableVolumeCubicMeters > 0 ? (volumeUtilizedByShipment / usableVolumeCubicMeters) * 100 : 0;
                        
                        const getContainerSizeDisplay = (size: string) => {
                          const sizeMap = {
                            "20-feet": "20 Feet",
                            "40-feet": "40 Feet", 
                            "40-feet-high-cube": "40 Feet High Cube",
                            "45-feet": "45 Feet"
                          } as const;
                          return sizeMap[size as keyof typeof sizeMap] || size;
                        };
                        
                        return (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="text-sm text-[#0E4A7E] dark:text-slate-400 font-bold mb-3">
                                  Container Details
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Container Size:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{getContainerSizeDisplay(containerSize)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Total Volume:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{containerVolumeCubicMeters} m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Usable Volume ({(CONTAINER_UTILIZATION * 100)}%):</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{usableVolumeCubicMeters.toFixed(1)} m³</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="text-sm text-[#0E4A7E] dark:text-slate-400 font-bold mb-3">
                                  Capacity Analysis
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Master Pack Volume:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{masterPackVolumeCubicMeters.toFixed(4)} m³</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Max Master Packs:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{maxMasterPacksPerContainer}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-400">Total Items in Container:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-medium">{maxItemsPerContainer.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-slate-300 dark:border-slate-600/50 pt-4 mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-300 font-medium">Master Packs Used:</span>
                                  <span className="text-[#0E4A7E] dark:text-slate-100 font-bold">{masterPacksUsed}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#0E4A7E] dark:text-slate-300 font-medium">Container Utilization:</span>
                                  <span className={`font-bold ${
                                    utilizationPercentage > 90 ? 'text-red-600 dark:text-red-400' : 
                                    utilizationPercentage > 75 ? 'text-yellow-600 dark:text-yellow-400' : 
                                    'text-green-600 dark:text-green-400'
                                  }`}>{utilizationPercentage.toFixed(1)}%</span>
                                </div>
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

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-[#0E4A7E] dark:text-slate-400">
              <p>&copy; 2025 Trade Facilitators, Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}