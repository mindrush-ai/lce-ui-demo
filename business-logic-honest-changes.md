
### Index Rates by Country
The index rates are still populating based on European countries. The index rates need be updated to only display China..

Fixed rates based on origin country:
- **China**: $6,000

### Output Duties Table Changes

I want to make the following changes to the table labelled as "DUTIES" in the output section:

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

  Row 4 - Chapter 99 Duty (Line Item 1):
  - Column 1: Output the first 99xx code under the relevant HTS code
  - Column 2: Output the description of first 99xx code
  - Column 3: Output the percentage of the first 99xx code
  - Column 4: Entered Value x Percentage of Line item (in USD)

  Row 5 - Chapter 99 Duty (Line Item 2):
  - Column 1: Output the second 99xx code under the relevant HTS code
  - Column 2: Output the description of second 99xx code
  - Column 3: Output the percentage of the second 99xx code
  - Column 4: Entered Value x Percentage of Line item (in USD)

  Row 6 - Chapter 99 Duty (Line Item 3):
  - Column 1: Output the third 99xx code under the relevant HTS code
  - Column 2: Output the description of third 99xx code
  - Column 3: Output the percentage of the third 99xx code
  - Column 4: Entered Value x Percentage of Line item (in USD)

  Row 7 - Total:
  - Column 1: "Total Duties" (bold)
  - Column 2: Empty
  - Column 3: Empty
  - Column 4: ${totalCustomsAndDuties} (formatted currency, bold, larger text,
  right-aligned)

  The table uses a 4-column layout with borders between rows and a thicker
  border
