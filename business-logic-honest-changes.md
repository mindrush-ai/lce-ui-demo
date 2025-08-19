
## Freight Calculations

### Index Rates by Country
The index rates are still populating based on European countries. The index rates need be updated to only display China..

Fixed rates based on origin country:
- **China**: $6,000

### Custom Rates
Users can opt to input custom freight costs instead of using index rates.

### Port Mapping
Origin ports are automatically assigned based on country:
- China → Shanghai (CN)

## Total Landed Cost Formula

```
Item Landed Cost (per case) = Unit Cost + (Total Duties ÷ Number of Units) + (Freight Costs ÷ Number of Units)
```

### Component Breakdown
- **Unit Cost**: Unit Cost (USD)
- **Duty Per Item**: Total customs duties divided by number of Units
- **Freight Per Item**: Total freight costs divided by number of Units

## Validation Rules

### Product Details
- **Item Number**: Required, any string
- **Item Name/Description**: Required, any string
- **HTS Code**: Must be one of the five supported codes
- **Country of Origin**: Must be CN
- **Unit Cost**: Required, positive number, max $999,999.9999 (4 decimal places)

### Item Details
- **Number of Units**: Integer

### Shipment Details
- **Container Size**: Currently only "40 Feet" supported
- **Incoterms**: "FCA (Supplier Facility)" or "FCA (Port of Loading)"
- **Origin Port**: Auto-populated based on country selection
- **Destination Port**: "Long Beach (US)"
- **Freight**: Either use index rates or provide custom rate (positive number)

## Business Constraints

### Current Limitations
1. **Product scope**: Wipes (5 HTS codes)
2. **Geographic scope**: China Only (1 country)
3. **Container types**: 40-foot containers only
4. **Duty structure**: To be calcualted using the formulas in the duty section

### Industry-Specific Logic
- Chapter 99 duty calculations for China imports
- Fixed freight rates based on common CN-US shipping routes

## Technical Implementation

### Key Files
- `client/src/pages/product-input.tsx`: Main calculation logic (lines 997-1051)
- `shared/schema.ts`: Validation schemas and type definitions
- `client/src/lib/countries.ts`: Country and port mapping

### Calculation Location
The core TLC calculation is implemented in the results section of the product input form, specifically in the "ITEM LANDED COST (CASE)" component starting at line 997 of `product-input.tsx`.



  Row 1 - Number of Units:
  - Column 1: "Number of Units"
  - Column 2: Empty
  - Column 3: "Units"
  - Column 4: {numberOfUnits} (right-aligned)

  Row 2 - Entered Value:
  - Column 1: "Entered Value"
  - Column 2: Empty
  - Column 3: Empty
  - Column 4: ${enteredValue} (formatted currency, right-aligned)

  Row 3 - HTS Code Duty:
  - Column 1: {htsCode} (the actual HTS code)
  - Column 2: "Base HTS Code Duty"
  - Column 3: "Free"
  - Column 4: ${baseHtsDutyAmount} (formatted currency, right-aligned)

  Row 4 - Chapter 99 Duty (only shows for China):
  - Column 1: "Chapter 99"
  - Column 2: "China Trade Duties"
  - Column 3: {chapter99DutyPercentage}% (percentage)
  - Column 4: ${chapter99Duty} (formatted currency, right-aligned)

  Row 5 - Total:
  - Column 1: "Total Duties" (bold)
  - Column 2: Empty
  - Column 3: Empty
  - Column 4: ${totalCustomsAndDuties} (formatted currency, bold, larger text,
  right-aligned)

  The table uses a 4-column layout with borders between rows and a thicker
  border