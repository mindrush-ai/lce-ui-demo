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

### Unit Calculations
- **Entered value**: Number of Units × Unit cost = Total USD value

## Customs Duty Calculations

### Geographic Scope
The system is designed specifically for imports from China:
- **Supported countries**: China (CN)

### Duty Rates

**3401.19.00.00**
3401.19.00.00	Base	0.00%
9903.01.24	IEEPA China 20%	20.00%
9903.01.25	IEEPA Reciprocal All Country 10%	10.00%
9903.88.15	Section 301 List 4A	7.50%

**5603.92.00.70**
5603.92.00.70	Base	0.00%
9903.01.24	IEEPA China 20%	20.00%
9903.01.25	IEEPA Reciprocal All Country 10%	10.00%
9903.88.03	Section 301 List 3	25.00%

**3401.11.50.00**
3401.11.50.00	Base	0.00%
9903.01.24	IEEPA China 20%	20.00%
9903.01.25	IEEPA Reciprocal All Country 10%	10.00%
9903.88.03	Section 301 List 3	25.00%

**5603.12.00.10**
5603.12.00.10	Base	0.00%
9903.01.24	IEEPA China 20%	20.00%
9903.01.25	IEEPA Reciprocal All Country 10%	10.00%
9903.88.03	Section 301 List 3	25.00%

**5603.14.90.10**
5603.14.90.10	Base	0.00%
9903.01.24	IEEPA China 20%	20.00%
9903.01.25	IEEPA Reciprocal All Country 10%	10.00%
9903.88.03	Section 301 List 3	25.00%


### Duty Structure
1. **Base HTS Code Duty**
   ```
   Base Duty = Entered Value × HTS Base Rate
   ```

2. **Chapter 99 Duty** (China Only)
   ```
   Chapter 99 Duty = Entered Value x (sum of all duties starting with code 99)
   ```

3. **Total Custom Duties**
   ```
   Total Duties = Base HTS Duty + Chapter 99 Duty
   ```

### Example Calculation - 5603.14.90.10
For 10000 units of wipes at $10/item from China:
- Entered Value: 10000 × $10 = $100,000
- Base HTS Duty: $100,000 × 0% = $0.00
- Chapter 99 Duty: $100,000 * (9903.01.24+9903.01.25+9903.88.03) = $100,000 * 55% = $55,000.00
- Total Duties: $0.00 + $55,000.00 = $55,000.00

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