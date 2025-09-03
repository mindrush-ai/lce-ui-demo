import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Check, Moon, Sun, Package, Archive, AlertTriangle, XCircle, Download, Home } from "lucide-react";
import jsPDF from "jspdf";
import tfiLogoPath from "@/assets/tfi-2024-logo.svg";

import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";
import { countries } from "@/lib/countries";
import { cn } from "@/lib/utils";

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
      htsCode: undefined,
      countryOfOrigin: "",
      unitCost: 0,
      masterPackLength: 0,
      masterPackWidth: 0,
      masterPackHeight: 0,
      masterPackWeight: 0,
      itemsPerMasterPack: 0,
      containerSize: undefined,
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

  const handleBackToHome = () => {
    setLocation("/");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const data = form.getValues();
    
    // Get form data
    const unitCost = data.unitCost || 0;
    const freightCost = data.freightCost || 0;
    const masterPackLength = data.masterPackLength || 0;
    const masterPackWidth = data.masterPackWidth || 0;
    const masterPackHeight = data.masterPackHeight || 0;
    const masterPackWeight = data.masterPackWeight || 0;
    const itemsPerMasterPack = data.itemsPerMasterPack || 0;
    const htsCode = data.htsCode || "";
    const countryOfOrigin = data.countryOfOrigin || "";
    
    // Container and capacity calculations (for display purposes only)
    const containerVolumeCubicMeters = CONTAINER_VOLUMES[data.containerSize as keyof typeof CONTAINER_VOLUMES] || 0;
    const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
    const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
    const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000;
    const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
    const maxUnitsPerContainer = maxMasterPacksPerContainer * itemsPerMasterPack;
    
    // For DUTIES - ITEM calculations, use single unit like web display
    const numberOfUnits = 1; // Single item
    const enteredValue = numberOfUnits * unitCost;
    const isChinaCountry = countryOfOrigin === "CN";
    
    // Base HTS Code Duty (all are 0%)
    const baseHtsDutyAmount = 0;
    
    // Chapter 99 duties for China
    let chapter99Duty = 0;
    let chapter99Codes: Array<{code: string, description: string, percentage: number}> = [];
    
    if (isChinaCountry) {
      const getChapter99Codes = (code: string) => {
        switch (code) {
          case "3401.19.00.00": return [
            { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
            { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
            { code: "9903.88.15", description: "Section 301 List 4A", percentage: 7.5 }
          ];
          case "5603.92.00.70":
          case "3401.11.50.00":
          case "5603.12.00.10":
          case "5603.14.90.10": return [
            { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
            { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
            { code: "9903.88.03", description: "Section 301 List 3", percentage: 25.0 }
          ];
          default: return [];
        }
      };
      
      chapter99Codes = getChapter99Codes(htsCode);
      chapter99Duty = chapter99Codes.reduce((sum, item) => sum + (enteredValue * (item.percentage / 100)), 0);
    }
    
    // Fees - Match exact web calculation logic
    const hmfFee = enteredValue * 0.00125; // HMF on single item value (like web)
    const mpfCalculated = enteredValue * 0.003464; // MPF also on single item value (like web)
    const mpfFeeContainer = Math.min(Math.max(mpfCalculated, 33.58), 651.50);
    const mpfPerItem = maxUnitsPerContainer > 0 ? mpfFeeContainer / maxUnitsPerContainer : 0;
    
    // Calculate total customs and duties exactly like web display
    const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Duty + hmfFee + mpfPerItem;
    const customsDutiesPerUnit = maxUnitsPerContainer > 0 ? totalCustomsAndDuties / maxUnitsPerContainer : 0;
    
    // For freight per item, use total container units like web display  
    const freightPerUnit = maxUnitsPerContainer > 0 ? freightCost / maxUnitsPerContainer : 0;
    
    // For DUTIES - ITEM table, calculate duties per single unit
    const totalDutiesForSingleItem = baseHtsDutyAmount + chapter99Duty + hmfFee + mpfPerItem;
    const totalDutiesPerUnit = numberOfUnits > 0 ? totalDutiesForSingleItem / numberOfUnits : 0;
    
    // Total landed cost should use duties per single unit (matching the DUTIES - ITEM table)
    const itemLandedCost = unitCost + totalDutiesPerUnit + freightPerUnit;
    
    // Colors
    const primaryColor = [14, 74, 126]; // #0E4A7E
    const lightBlueColor = [219, 234, 254];
    const grayColor = [107, 114, 128];
    
    // Header - Trade Facilitators, INC.
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Trade Facilitators, INC.", 105, 15, { align: 'center' });
    
    // H2 - TOTAL LANDED COST
    doc.setFontSize(20);
    doc.text("TOTAL LANDED COST", 105, 28, { align: 'center' });
    
    // Generated on timestamp
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    doc.text(`Generated on: ${dateStr} ${timeStr}`, 105, 38, { align: 'center' });
    
    // Product Information Section
    let yPos = 50;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Product Information", 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Two-column borderless table layout
    const leftColumnX = 20;
    const rightColumnX = 110;
    const lineHeight = 7;
    let currentY = yPos;
    
    // First column (4 items)
    doc.text(`Item Number: ${data.itemNumber}`, leftColumnX, currentY);
    currentY += lineHeight;
    doc.text(`Name/Description: ${data.nameId}`, leftColumnX, currentY);
    currentY += lineHeight;
    doc.text(`HTS Code: ${htsCode}`, leftColumnX, currentY);
    currentY += lineHeight;
    doc.text(`Country of Origin: ${countryOfOrigin === 'CN' ? 'China' : countryOfOrigin}`, leftColumnX, currentY);
    
    // Second column (3 items) - start from same Y position
    let rightColumnY = yPos;
    doc.text(`Unit Cost: $${unitCost.toFixed(4)}`, rightColumnX, rightColumnY);
    rightColumnY += lineHeight;
    doc.text(`Container: ${data.containerSize}`, rightColumnX, rightColumnY);
    rightColumnY += lineHeight;
    doc.text(`Maximum Units in Container: ${maxUnitsPerContainer.toLocaleString()}`, rightColumnX, rightColumnY);
    
    // Set yPos to the bottom of the tallest column
    yPos = Math.max(currentY, rightColumnY);
    
    // DUTIES - ITEM Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("DUTIES - ITEM", 105, yPos, { align: 'center' });
    
    yPos += 8;
    
    // Table data preparation
    const tableData = [
      ["Customs Unit of Measure", "", "", "1"],
      ["Unit Cost", "", "", `$${unitCost.toFixed(4)}`],
      [htsCode, "Base HTS Code Duty", "0.00%", `$${baseHtsDutyAmount.toFixed(4)}`]
    ];
    
    // Add Chapter 99 duties if applicable (showing per-item values to match web)
    chapter99Codes.forEach((item) => {
      const dutyAmount = enteredValue * (item.percentage / 100);
      const dutyPerItem = numberOfUnits > 0 ? dutyAmount / numberOfUnits : 0;
      tableData.push([
        item.code,
        item.description,
        `${item.percentage.toFixed(1)}%`,
        `$${dutyPerItem.toFixed(4)}`
      ]);
    });
    
    // Add fees (showing per-item values to match web)
    const hmfPerItem = numberOfUnits > 0 ? hmfFee / numberOfUnits : 0;
    tableData.push(
      ["HMF", "Harbor Maintenance Fee", "", `$${hmfPerItem.toFixed(4)}`],
      ["MPF", "Merchandise Processing Fee", "", `$${mpfPerItem.toFixed(4)}`]
    );
    
    // Draw table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    tableData.forEach((row, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos - 3, 170, 8, 'F');
      }
      
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(row[0], 22, yPos + 2);
      doc.text(row[1], 70, yPos + 2);
      doc.text(row[2], 130, yPos + 2);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(row[3], 188, yPos + 2, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      
      // Draw row separator
      doc.setDrawColor(230, 230, 230);
      doc.line(20, yPos + 4, 190, yPos + 4);
      
      yPos += 8;
    });
    
    // Total duties row
    doc.setLineWidth(1);
    doc.setDrawColor(100, 100, 100);
    doc.line(20, yPos - 1, 190, yPos - 1);
    
    const totalPercentage = chapter99Codes.reduce((sum, item) => sum + item.percentage, 0);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("Total Duties", 22, yPos + 3);
    doc.text(`${totalPercentage.toFixed(2)}%`, 130, yPos + 3);
    doc.text(`$${totalDutiesPerUnit.toFixed(4)}`, 188, yPos + 3, { align: 'right' });
    
    // Duty Per Item highlight box - showing the per-item total as per web version
    yPos += 12;
    doc.setFillColor(lightBlueColor[0], lightBlueColor[1], lightBlueColor[2]);
    doc.roundedRect(20, yPos, 170, 12, 3, 3, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, 170, 12, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Duty Per Item", 25, yPos + 8);
    doc.text(`$${totalDutiesPerUnit.toFixed(2)}`, 185, yPos + 8, { align: 'right' });
    
    // FREIGHT COSTS Section
    yPos += 18;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("FREIGHT COSTS", 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`${countryOfOrigin === 'CN' ? 'China' : countryOfOrigin} to United States`, 22, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Total Freight Costs", 22, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${freightCost.toLocaleString()}`, 188, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(22, yPos, 188, yPos);
    
    yPos += 8;
    
    // Freight Per Item highlight box - matching Duty Per Item styling exactly
    doc.setFillColor(lightBlueColor[0], lightBlueColor[1], lightBlueColor[2]);
    doc.roundedRect(20, yPos, 170, 12, 3, 3, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(20, yPos, 170, 12, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Freight Per Item", 25, yPos + 8);
    doc.text(`$${freightPerUnit.toFixed(2)}`, 185, yPos + 8, { align: 'right' });
    
    // Continue on the same page
    yPos += 18;
    
    // TOTAL LANDED COST - Final highlighted section
    doc.setFillColor(lightBlueColor[0], lightBlueColor[1], lightBlueColor[2]);
    doc.roundedRect(15, yPos, 180, 30, 5, 5, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.roundedRect(15, yPos, 180, 30, 5, 5, 'S');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("TOTAL LANDED COST", 105, yPos + 12, { align: 'center' });
    
    doc.setFontSize(24);
    doc.text(`$${itemLandedCost.toFixed(2)}`, 105, yPos + 22, { align: 'center' });
    
    // Footer removed as per requirements
    
    // Save with new filename format: TLC_Calculation_<Name/Description>_GeneratedDate-Time
    const nameDescription = (data.nameId || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const dateTimeStr = `${now.toISOString().split('T')[0]}-${now.toTimeString().split(' ')[0].replace(/:/g, '-')}`;
    doc.save(`TLC_Calculation_${nameDescription}_${dateTimeStr}.pdf`);
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
      
      const updated = prev.map((section, index) => {
        if (section.id === sectionId) {
          // Mark the current section as completed and collapsed
          return { ...section, isCompleted: true, isCollapsed: true };
        } else if (index === nextIndex && nextIndex < prev.length) {
          // Expand the next section after the completed one
          return { ...section, isCollapsed: false };
        }
        return section;
      });

      // Scroll to the next section header after a delay to allow DOM update
      if (nextIndex < prev.length) {
        const nextSectionId = prev[nextIndex].id;
        setTimeout(() => {
          const nextSectionHeaderElement = document.getElementById(`section-header-${nextSectionId}`);
          if (nextSectionHeaderElement) {
            // Calculate header height to avoid it covering the section
            const stickyHeader = document.querySelector('header') || document.querySelector('nav');
            const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 80; // fallback to 80px
            
            // Scroll to element and account for sticky header
            nextSectionHeaderElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            
            // Add offset for sticky header plus small buffer
            setTimeout(() => {
              window.scrollBy(0, -(headerHeight + 20));
            }, 300);
          } else {
            console.warn(`Section header element not found: section-header-${nextSectionId}`);
          }
        }, 200);
      }

      return updated;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-foreground font-sans transition-colors duration-300 relative">
      <div className="min-h-screen flex flex-col relative z-10">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex items-center justify-between">
              {/* Left Side - Brand Text */}
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <span className="text-xl sm:text-2xl font-semibold" style={{color: '#0E4A7E'}}>TLC</span>
                  <span className="text-base hidden md:inline" style={{color: '#0E4A7E'}}>Total Landed Cost Engine</span>
                </div>
              </Link>
              
              {/* Center - Logo Only (Responsive) */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img 
                  src={tfiLogoPath} 
                  alt="TFI Logo" 
                  className="h-10 sm:h-16 md:h-20 w-auto hover:scale-105 transition-transform duration-200 drop-shadow-md"
                />
              </div>
              
              {/* Right Side - Actions */}
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
                
                <Button 
                  variant="outline"
                  onClick={handleBackToHome}
                  data-testid="button-back-home"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <Home className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
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
                  data-section-id={section.id}
                >
                  {/* Section Header */}
                  <div
                    id={`section-header-${section.id}`}
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
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" data-testid="select-hts-code">
                                          <SelectValue placeholder="Select HTS Code" className="text-slate-500 dark:text-slate-400" />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                                          <SelectItem value="3401.19.00.00" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            3401.19.00.00
                                          </SelectItem>
                                          <SelectItem value="5603.92.00.70" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            5603.92.00.70
                                          </SelectItem>
                                          <SelectItem value="3401.11.50.00" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            3401.11.50.00
                                          </SelectItem>
                                          <SelectItem value="5603.12.00.10" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            5603.12.00.10
                                          </SelectItem>
                                          <SelectItem value="5603.14.90.10" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            5603.14.90.10
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" data-testid="select-country">
                                          <SelectValue placeholder="Select country" className="text-slate-500 dark:text-slate-400" />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                                          {countries.map((country) => (
                                            <SelectItem 
                                              key={country.code} 
                                              value={country.code}
                                              className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
                                            >
                                              {country.flag} {country.name} ({country.code})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
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
                                            const inputValue = e.target.value;
                                            if (inputValue === '') {
                                              field.onChange(0);
                                            } else {
                                              // Check if input has more than 4 decimal places
                                              const decimalIndex = inputValue.indexOf('.');
                                              if (decimalIndex !== -1 && inputValue.length - decimalIndex > 5) {
                                                // Truncate to 4 decimal places to prevent further input
                                                const truncated = inputValue.substring(0, decimalIndex + 5);
                                                const value = parseFloat(truncated);
                                                if (!isNaN(value)) {
                                                  const rounded = Math.round(value * 10000) / 10000;
                                                  field.onChange(rounded);
                                                }
                                                return;
                                              }
                                              
                                              const value = parseFloat(inputValue);
                                              if (!isNaN(value)) {
                                                const rounded = Math.round(value * 10000) / 10000;
                                                field.onChange(rounded);
                                              }
                                            }
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
                                                step="0.01"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const inputValue = e.target.value;
                                                  if (inputValue === '') {
                                                    field.onChange(0);
                                                  } else {
                                                    // Check if input has more than 2 decimal places
                                                    const decimalIndex = inputValue.indexOf('.');
                                                    if (decimalIndex !== -1 && inputValue.length - decimalIndex > 3) {
                                                      // Truncate to 2 decimal places to prevent further input
                                                      const truncated = inputValue.substring(0, decimalIndex + 3);
                                                      const value = parseFloat(truncated);
                                                      if (!isNaN(value)) {
                                                        const rounded = Math.round(value * 100) / 100;
                                                        field.onChange(rounded);
                                                      }
                                                      return;
                                                    }
                                                    
                                                    const value = parseFloat(inputValue);
                                                    if (!isNaN(value)) {
                                                      const rounded = Math.round(value * 100) / 100;
                                                      field.onChange(rounded);
                                                    }
                                                  }
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
                                                step="0.01"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const inputValue = e.target.value;
                                                  if (inputValue === '') {
                                                    field.onChange(0);
                                                  } else {
                                                    // Check if input has more than 2 decimal places
                                                    const decimalIndex = inputValue.indexOf('.');
                                                    if (decimalIndex !== -1 && inputValue.length - decimalIndex > 3) {
                                                      // Truncate to 2 decimal places to prevent further input
                                                      const truncated = inputValue.substring(0, decimalIndex + 3);
                                                      const value = parseFloat(truncated);
                                                      if (!isNaN(value)) {
                                                        const rounded = Math.round(value * 100) / 100;
                                                        field.onChange(rounded);
                                                      }
                                                      return;
                                                    }
                                                    
                                                    const value = parseFloat(inputValue);
                                                    if (!isNaN(value)) {
                                                      const rounded = Math.round(value * 100) / 100;
                                                      field.onChange(rounded);
                                                    }
                                                  }
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
                                                step="0.01"
                                                min="0"
                                                className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const inputValue = e.target.value;
                                                  if (inputValue === '') {
                                                    field.onChange(0);
                                                  } else {
                                                    // Check if input has more than 2 decimal places
                                                    const decimalIndex = inputValue.indexOf('.');
                                                    if (decimalIndex !== -1 && inputValue.length - decimalIndex > 3) {
                                                      // Truncate to 2 decimal places to prevent further input
                                                      const truncated = inputValue.substring(0, decimalIndex + 3);
                                                      const value = parseFloat(truncated);
                                                      if (!isNaN(value)) {
                                                        const rounded = Math.round(value * 100) / 100;
                                                        field.onChange(rounded);
                                                      }
                                                      return;
                                                    }
                                                    
                                                    const value = parseFloat(inputValue);
                                                    if (!isNaN(value)) {
                                                      const rounded = Math.round(value * 100) / 100;
                                                      field.onChange(rounded);
                                                    }
                                                  }
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
                                            step="0.01"
                                            min="0"
                                            className="w-full h-[50px] px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            value={field.value || ''}
                                            onChange={(e) => {
                                              const inputValue = e.target.value;
                                              if (inputValue === '') {
                                                field.onChange(0);
                                              } else {
                                                // Check if input has more than 2 decimal places
                                                const decimalIndex = inputValue.indexOf('.');
                                                if (decimalIndex !== -1 && inputValue.length - decimalIndex > 3) {
                                                  // Truncate to 2 decimal places to prevent further input
                                                  const truncated = inputValue.substring(0, decimalIndex + 3);
                                                  const value = parseFloat(truncated);
                                                  if (!isNaN(value)) {
                                                    const rounded = Math.round(value * 100) / 100;
                                                    field.onChange(rounded);
                                                  }
                                                  return;
                                                }
                                                
                                                const value = parseFloat(inputValue);
                                                if (!isNaN(value)) {
                                                  const rounded = Math.round(value * 100) / 100;
                                                  field.onChange(rounded);
                                                }
                                              }
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
                                              const inputValue = e.target.value;
                                              if (inputValue === '') {
                                                field.onChange(0);
                                              } else {
                                                const value = parseInt(inputValue);
                                                if (!isNaN(value) && value >= 0) {
                                                  field.onChange(value);
                                                }
                                              }
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
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" data-testid="select-container-size">
                                          <SelectValue placeholder="Select container size" className="text-slate-500 dark:text-slate-400" />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                                          <SelectItem value="20-feet" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            20 Feet
                                          </SelectItem>
                                          <SelectItem value="40-feet" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            40 Feet
                                          </SelectItem>
                                          <SelectItem value="40-feet-high-cube" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            40 Feet High Cube
                                          </SelectItem>
                                          <SelectItem value="45-feet" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            45 Feet
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" data-testid="select-incoterms">
                                          <SelectValue placeholder="Select Incoterms Rule" className="text-slate-500 dark:text-slate-400" />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                                          <SelectItem value="FCA-SUPPLIER" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            FCA (Supplier Facility)
                                          </SelectItem>
                                          <SelectItem value="FCA-PORT" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            FCA (Port of Loading)
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full h-[50px] px-4 py-0 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" data-testid="select-destination-port">
                                          <SelectValue placeholder="Select destination port" className="text-slate-500 dark:text-slate-400" />
                                        </SelectTrigger>
                                        <SelectContent className="z-50 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-lg">
                                          <SelectItem value="Long Beach (US)" className="text-[#0E4A7E] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600">
                                            Long Beach (US)
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                            step="1"
                                            className="w-full h-[50px] pl-8 pr-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 !rounded-xl text-[#0E4A7E] dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            data-testid="input-freight-cost"
                                            value={field.value || ""}
                                            onChange={(e) => {
                                              const inputValue = e.target.value;
                                              if (inputValue === '') {
                                                field.onChange(0);
                                              } else {
                                                const value = parseInt(inputValue);
                                                if (!isNaN(value) && value >= 0) {
                                                  field.onChange(value);
                                                }
                                              }
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
                        // Calculate header height to avoid it covering the results
                        const stickyHeader = document.querySelector('header') || document.querySelector('nav');
                        const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 80; // fallback to 80px
                        
                        // Scroll to results and account for sticky header
                        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Add offset for sticky header plus small buffer
                        setTimeout(() => {
                          window.scrollBy(0, -(headerHeight + 20));
                        }, 300);
                      }
                    }, 200);
                  }}
                  className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-white font-bold text-lg py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-primary/25"
                  data-testid="button-calculate-tlc"
                >
                  <span className="flex items-center space-x-2">
                    <span>Calculate Total Landed Cost</span>
                  </span>
                </Button>
              </div>
            )}

            {/* Results Section */}
            {showResults && (
              <div id="results-section" className="mt-12 mb-8">
                <div className="mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Total Landed Cost</h2>
                    <p className="text-[#0E4A7E] dark:text-slate-400">Your calculated cost breakdown</p>
                  </div>
                </div>

                <div className="space-y-6">

                  {/* Box 2A - Duties Per Item (Full Width) */}
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-slate-700/50 p-6 mb-6">
                    <h3 className="font-semibold text-foreground mb-6 text-center text-[20px]">DUTIES - ITEM</h3>
                    <hr className="border-slate-300/50 dark:border-slate-600/50 mb-6" />
                    <div className="space-y-4">
                      {(() => {
                        const unitCost = form.getValues("unitCost") || 0;
                        const htsCode = form.getValues("htsCode") || "";
                        const countryOfOrigin = form.getValues("countryOfOrigin") || "";
                        
                        // For single item calculations
                        const numberOfUnits = 1; // Single item
                        const isChinaCountry = countryOfOrigin === "CN";
                        const enteredValue = numberOfUnits * unitCost; // in USD (single item value)
                        
                        // Base HTS Code Duty calculation (all wipes are duty-free)
                        const baseHtsDutyAmount = 0; // All supported HTS codes are duty-free
                        
                        // Chapter 99 Duty calculation for China (single item)
                        const getChapter99Codes = (htsCode: string) => {
                          switch (htsCode) {
                            case "3401.19.00.00": 
                              return [
                                { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
                                { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
                                { code: "9903.88.15", description: "Section 301 List 4A", percentage: 7.5 }
                              ];
                            case "5603.92.00.70":
                              return [
                                { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
                                { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
                                { code: "9903.88.03", description: "Section 301 List 3", percentage: 25.0 }
                              ];
                            case "3401.11.50.00":
                              return [
                                { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
                                { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
                                { code: "9903.88.03", description: "Section 301 List 3", percentage: 25.0 }
                              ];
                            case "5603.12.00.10":
                              return [
                                { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
                                { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
                                { code: "9903.88.03", description: "Section 301 List 3", percentage: 25.0 }
                              ];
                            case "5603.14.90.10":
                              return [
                                { code: "9903.01.24", description: "IEEPA China 20%", percentage: 20.0 },
                                { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", percentage: 10.0 },
                                { code: "9903.88.03", description: "Section 301 List 3", percentage: 25.0 }
                              ];
                            default:
                              return [];
                          }
                        };
                        
                        const chapter99Codes = isChinaCountry ? getChapter99Codes(htsCode) : [];
                        
                        // Calculate HMF and MPF for single item
                        const hmfFee = enteredValue * 0.00125;
                        const mpfFeeContainer = (() => {
                          const calculated = enteredValue * 0.003464;
                          return Math.min(Math.max(calculated, 33.58), 651.50);
                        })();
                        
                        // Calculate MPF per item (divide container MPF by total units)
                        const mpfPerItem = (() => {
                          const containerUnits = form.getValues("itemsPerMasterPack") || 1;
                          const masterPackLength = form.getValues("masterPackLength") || 1;
                          const masterPackWidth = form.getValues("masterPackWidth") || 1;
                          const masterPackHeight = form.getValues("masterPackHeight") || 1;
                          const containerSize = form.getValues("containerSize") || "";
                          const CONTAINER_VOLUMES = {
                            "20-feet": 28,
                            "40-feet": 54,
                            "40-feet-high-cube": 68,
                            "45-feet": 86
                          };
                          const CONTAINER_UTILIZATION = 0.80;
                          const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize as keyof typeof CONTAINER_VOLUMES] || 28;
                          const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                          const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                          const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000;
                          const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                          const totalContainerUnits = maxMasterPacksPerContainer * containerUnits;
                          return totalContainerUnits > 0 ? mpfFeeContainer / totalContainerUnits : 0;
                        })();
                        
                        const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Codes.reduce((sum, item) => sum + (enteredValue * (item.percentage / 100)), 0) + hmfFee + mpfPerItem;
                        
                        const getHtsDescription = (code: string) => {
                          const descriptions = {
                            "3401.19.00.00": "Baby Wipes & Flushable Wipes",
                            "5603.92.00.70": "Dry Wipes",
                            "3401.11.50.00": "Benefit Wipes & Makeup Wipes",
                            "5603.12.00.10": "Sanitizing Wipes",
                            "5603.14.90.10": "Sanitizing Wipes"
                          };
                          return descriptions[code as keyof typeof descriptions] || "Select HTS Code in previous section";
                        };
                        
                        return (
                          <>
                            <Table>
                              <TableBody>
                                {/* ROW 1 - Number of Units */}
                                <TableRow className="border-b border-slate-300 dark:border-slate-600/30">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Customs Unit of Measure</TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">{numberOfUnits.toLocaleString()}</TableCell>
                                </TableRow>
                                
                                {/* ROW 2 - Unit Cost */}
                                <TableRow className="border-b border-slate-300 dark:border-slate-600/30">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Unit Cost</TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${unitCost.toFixed(4)}</TableCell>
                                </TableRow>
                                
                                {/* ROW 3 - HTS Code Duty */}
                                <TableRow className="border-b border-slate-300 dark:border-slate-600/30">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{htsCode}</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{getHtsDescription(htsCode)}</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">0.00%</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${baseHtsDutyAmount.toFixed(4)}</TableCell>
                                </TableRow>
                                
                                {/* ROW 4-6 - Chapter 99 Duty (Line Items 1-3) for China */}
                                {isChinaCountry && chapter99Codes.map((item, index) => (
                                  <TableRow key={index} className="border-b border-slate-300 dark:border-slate-600/30">
                                    <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.code}</TableCell>
                                    <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.description}</TableCell>
                                    <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">{item.percentage.toFixed(1)}%</TableCell>
                                    <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${(enteredValue * (item.percentage / 100)).toFixed(4)}</TableCell>
                                  </TableRow>
                                ))}
                                
                                {/* ROW 7 - HMF (Harbor Maintenance Fee) */}
                                <TableRow className="border-b border-slate-300 dark:border-slate-600/30">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">HMF</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Harbor Maintenance Fee</TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${(enteredValue * 0.00125).toFixed(4)}</TableCell>
                                </TableRow>
                                
                                {/* ROW 8 - MPF (Merchandise Processing Fee) */}
                                <TableRow className="border-b border-slate-300 dark:border-slate-600/30">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">MPF</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-400 font-medium">Merchandise Processing Fee</TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${(() => {
                                    const calculated = enteredValue * 0.003464;
                                    const mpfAmount = Math.min(Math.max(calculated, 33.58), 651.50);
                                    // For single item, divide by the total container units to get per-item amount
                                    const containerUnits = form.getValues("itemsPerMasterPack") || 1;
                                    const masterPackLength = form.getValues("masterPackLength") || 1;
                                    const masterPackWidth = form.getValues("masterPackWidth") || 1;
                                    const masterPackHeight = form.getValues("masterPackHeight") || 1;
                                    const containerSize = form.getValues("containerSize") || "";
                                    const CONTAINER_VOLUMES = {
                                      "20-feet": 28,
                                      "40-feet": 54,
                                      "40-feet-high-cube": 68,
                                      "45-feet": 86
                                    };
                                    const CONTAINER_UTILIZATION = 0.80;
                                    const containerVolumeCubicMeters = CONTAINER_VOLUMES[containerSize as keyof typeof CONTAINER_VOLUMES] || 28;
                                    const usableVolumeCubicMeters = containerVolumeCubicMeters * CONTAINER_UTILIZATION;
                                    const masterPackVolumeCubicCm = masterPackLength * masterPackWidth * masterPackHeight;
                                    const masterPackVolumeCubicMeters = masterPackVolumeCubicCm / 1000000;
                                    const maxMasterPacksPerContainer = masterPackVolumeCubicMeters > 0 ? Math.floor(usableVolumeCubicMeters / masterPackVolumeCubicMeters) : 0;
                                    const totalContainerUnits = maxMasterPacksPerContainer * containerUnits;
                                    const mpfPerItem = totalContainerUnits > 0 ? mpfAmount / totalContainerUnits : 0;
                                    return mpfPerItem.toFixed(4);
                                  })()}</TableCell>
                                </TableRow>
                                
                                {/* ROW 9 - Total Duties for Single Item */}
                                <TableRow className="border-t-2 border-slate-400 dark:border-slate-500">
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold">Total Duties</TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold">{(() => {
                                    const basePercentage = 0; // Row 3 - HTS Code Duty
                                    const chapter99Percentage = isChinaCountry ? chapter99Codes.reduce((sum, item) => sum + item.percentage, 0) : 0; // Rows 4-6
                                    const totalPercentage = basePercentage + chapter99Percentage;
                                    return totalPercentage.toFixed(2) + '%';
                                  })()}</TableCell>
                                  <TableCell className="py-3 text-[#0E4A7E] dark:text-slate-100 font-bold text-right">${totalCustomsAndDuties.toFixed(4)}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                            
                            <div className="border-t border-slate-300 dark:border-slate-600/50 pt-3 mt-4">
                              <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-primary dark:text-primary/80 font-bold text-lg">Duty Per Item</span>
                                  <span className="text-primary dark:text-primary/90 font-bold text-xl">${totalCustomsAndDuties.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </>
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

                </div>
                
                {/* ITEM LANDED COST (PER UNIT) - Moved to bottom */}
                <div className="mt-8">
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
                </div>
                
                {/* Bottom Export PDF Button */}
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={exportToPDF}
                    className="bg-gradient-to-r from-primary to-primary hover:from-primary/90 hover:to-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-primary/25 flex items-center space-x-2"
                    data-testid="button-export-pdf-bottom"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </Button>
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