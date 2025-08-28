import { z } from "zod";

// Product Information Schema
export const productInfoSchema = z.object({
  itemNumber: z.string().min(1, "Item Number is required"),
  nameId: z.string().min(1, "Item Name/Description is required"),
  htsCode: z.enum(["3401.19.00.00", "5603.92.00.70", "3401.11.50.00", "5603.12.00.10", "5603.14.90.10"], {
    required_error: "Please select an HTS Code"
  }).optional(),
  countryOfOrigin: z.string().min(2, "Country of origin is required"),
  unitCost: z.number()
    .positive("Unit cost must be positive")
    .max(999999.9999, "Unit cost too large"),
  // Section 2 - Units and Dimensions
  // Master Pack fields
  masterPackLength: z.number()
    .positive("Master pack length must be positive"),
  masterPackWidth: z.number()
    .positive("Master pack width must be positive"),
  masterPackHeight: z.number()
    .positive("Master pack height must be positive"),
  masterPackWeight: z.number()
    .positive("Master pack weight must be positive"),
  itemsPerMasterPack: z.number()
    .int("Items per master pack must be a whole number")
    .min(1, "Items per master pack must be at least 1"),
  // Section 3 - Shipment Details
  containerSize: z.enum(["20-feet", "40-feet", "40-feet-high-cube", "45-feet"], {
    required_error: "Please select a container size"
  }).optional(),
  incoterms: z.string().min(1, "Incoterms is required"),
  originPort: z.string().min(1, "Origin port is required"),
  destinationPort: z.string().min(1, "Destination port is required"),
  // Freight Charges - removed index rates, only custom rates
  freightCost: z.number()
    .positive("Freight cost must be positive")
});

export type ProductInfo = z.infer<typeof productInfoSchema>;

