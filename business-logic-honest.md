# Business Logic Documentation

This document outlines the current business logic implemented in the Total Landed Cost (TLC) calculator for The Honest Company demo (forked from MGX Beverage Group).

This is the updated business logic for The Honest Company.

### Supported HTS Codes
- **3401.19.00.00**: Baby Wipes & Flushable Wipes
  - Base duty: Free
- **5603.92.00.70**: Dry Wipes
  - Base duty: Free
- **3401.11.50.00**: Benefit Wipes & Makeup Wipes
  - Base duty: Free
- **5603.12.00.10**: Sanitizing Wipes
  - Base duty: Free
- **5603.14.90.10**: Sanitizing Wipes
  - Base duty: Free

### Unit Calculations - TBC
- **Volume conversion**: Cases × 12 bottles × 0.75L = Total liters
- **Entered value**: Cases × Unit cost = Total USD value

## Customs Duty Calculations

### Geographic Scope
The system is designed specifically for imports from China:
- **Supported countries**: China (CN)

### Duty Structure
1. **Base HTS Code Duty**
   ```
   Base Duty = Total Liters × HTS Rate (cents per liter)
   ```

2. **Chapter 99 Duty** (China Only)
   ```
   Target Total Duty = Entered Value × 15%
   Chapter 99 Duty = max(0, Target Total Duty - Base HTS Duty)
   ```

3. **Total Custom Duties**
   ```
   Total Duties = Base HTS Duty + Chapter 99 Duty
   ```

### Example Calculation
For 100 cases of red wine at $10/case from France:
- Volume: 100 × 12 × 0.75 = 900 liters
- Entered Value: 100 × $10 = $1,000
- Base HTS Duty: 900 × $0.063 = $56.70
- Target 15% Duty: $1,000 × 15% = $150
- Chapter 99 Duty: $150 - $56.70 = $93.30
- Total Duties: $56.70 + $93.30 = $150

## Freight Calculations

### Index Rates by Country
Fixed rates based on origin country:
- **China**: $6,000

### Custom Rates
Users can opt to input custom freight costs instead of using index rates.

### Port Mapping
Origin ports are automatically assigned based on country:
- China → Shanghai (CN)

## Total Landed Cost Formula

```
Item Landed Cost (per case) = Unit Cost + (Total Duties ÷ Number of Cases) + (Freight Costs ÷ Number of Cases)
```

### Component Breakdown
- **Unit Cost**: Base cost per case (USD)
- **Duty Per Case**: Total customs duties divided by number of cases
- **Freight Per Case**: Total freight costs divided by number of cases

## Validation Rules

### Product Details
- **Item Number**: Required, any string
- **Item Name/Description**: Required, any string
- **HTS Code**: Must be one of the two supported codes
- **Country of Origin**: Must be FR, IT, PT, or ES
- **Unit Cost**: Required, positive number, max $999,999.9999 (4 decimal places)

### Item Details
- **Number of Wine Cases**: Integer between 1 and 1,260

### Shipment Details
- **Container Size**: Currently only "40 Feet" supported
- **Incoterms**: "FCA (Supplier Facility)" or "FCA (Port of Loading)"
- **Origin Port**: Auto-populated based on country selection
- **Destination Port**: "Long Beach (US)"
- **Freight**: Either use index rates or provide custom rate (positive number)

## Business Constraints

### Current Limitations
1. **Product scope**: Wine only (2 HTS codes)
2. **Geographic scope**: EU countries only (4 countries)
3. **Container types**: 40-foot containers only
4. **Duty structure**: 15% cumulative rate for EU
5. **Volume assumption**: Standard wine bottles (0.75L)

### Industry-Specific Logic
- Wine case = 12 bottles of 0.75L each
- EU trade relationship with specific duty structures
- Chapter 99 duty calculations for EU imports
- Fixed freight rates based on common EU-US shipping routes

## Technical Implementation

### Key Files
- `client/src/pages/product-input.tsx`: Main calculation logic (lines 997-1051)
- `shared/schema.ts`: Validation schemas and type definitions
- `client/src/lib/countries.ts`: Country and port mapping

### Calculation Location
The core TLC calculation is implemented in the results section of the product input form, specifically in the "ITEM LANDED COST (CASE)" component starting at line 997 of `product-input.tsx`.