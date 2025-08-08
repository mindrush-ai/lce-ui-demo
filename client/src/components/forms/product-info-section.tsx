import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productInfoSchema, type ProductInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface ProductInfoSectionProps {
  onSubmit: (data: ProductInfo) => void;
  initialData?: ProductInfo;
  isLoading?: boolean;
}

export function ProductInfoSection({ onSubmit, initialData, isLoading }: ProductInfoSectionProps) {
  const form = useForm<ProductInfo>({
    resolver: zodResolver(productInfoSchema),
    defaultValues: {
      nameId: initialData?.nameId || "",
      htsCode: initialData?.htsCode || "",
    },
  });

  const handleHtsCodeChange = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 7 digits (4 + 3)
    const limitedDigits = digits.slice(0, 7);
    
    // Format as XXXX.XXX if we have enough digits
    if (limitedDigits.length > 4) {
      const formatted = limitedDigits.slice(0, 4) + '.' + limitedDigits.slice(4);
      form.setValue('htsCode', formatted);
    } else {
      form.setValue('htsCode', limitedDigits);
    }
  };

  return (
    <div className="space-y-6" data-testid="product-info-section">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nameId"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="name-id" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                  Product Name/ID
                </Label>
                <FormControl>
                  <Input
                    id="name-id"
                    type="text"
                    placeholder="Enter product name or identifier"
                    className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    data-testid="input-name-id"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="htsCode"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="hts-code" className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
                  HTS Code
                  <span className="text-slate-500 ml-2 text-xs">(Format: XXXX.XXX)</span>
                </Label>
                <FormControl>
                  <Input
                    id="hts-code"
                    type="text"
                    placeholder="0000.000"
                    maxLength={8}
                    className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 border border-slate-600 dark:border-slate-600 rounded-xl text-slate-100 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    data-testid="input-hts-code"
                    value={field.value}
                    onChange={(e) => {
                      handleHtsCodeChange(e.target.value);
                    }}
                  />
                </FormControl>
                <p className="text-xs text-slate-500 mt-1">
                  Harmonized Tariff Schedule code (7 digits formatted as XXXX.XXX)
                </p>
                <FormMessage className="text-red-400 text-sm mt-1" />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-800"
              disabled={isLoading}
              data-testid="button-save-product-info"
            >
              {isLoading ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}