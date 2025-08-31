
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

# Changes - 22 Aug 2025

# User Inputs

## Units and Dimensions

- Keep the "HTS Code Description" field
- We need to change the business logic of "Number of Units"

### Master Pack (New Heading under Units and Dimensions)
The following inputs need to be entered
- Master Pack Dimensions (cm) - Multi Input Field (L x W X H), three inputs in cm
- Master Pack Weight (kg)
- Items per Master Pack - 1 and above - whole numbers only


## Shipment Details

- Container Size - fixed options - 20 Feet, 40 Feet, 40 Feet High Cube, 45 Feet

### Freight Charges
- Remove the index rate logic
- Let the user enter their own rate

# System Variables / Inputs - Non Fixed

For this version, we will make them hardcoded. The later versions will give the user ability to change these variables.

## Overall
- Container Utilization = 0.90

# System Variables / Inputs - Fixed

## Container Volumes
- 20 Feet = 30 cubic meters
- 40 Feet = 60 cubic meters
- 40 Feet High Cube = 70 cubic meters
- 45 Feet = 80 cubic meters


## Units and Dimensions
- We can get rid of "Number of Units" field in the input

## Calculations
- We need to change the calculations to accomodate for the deletion of "Number of Units"
- We will now calculate the maximum number of units that can be fitted in the choosen container size


# 25 Aug Changes

## Duty Rates

Here are the duty rates configured in the system already. For every line under each bold, the first part of the text is the HST code, after the tab you have the description, and the last tab contains the rate of the duty

**3401.19.00.00**
3401.19.00.00 Base  0.00%
9903.01.24  IEEPA China 20%	20.00%
9903.01.25  IEEPA Reciprocal All Country 10%	10.00%
9903.88.15  Section 301 List 4A	7.50%

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

## Duties Ouput Table Changes
* For rows 3,4,5 & 6. I need you to change column 2 and print out the description of each HTS code

## Duties Ouput Table Changes - Iteration 2
* For Row 1, make column 3 emoty
* Remove (Case) from the text Duty Per Item

## Duties Ouput Table Changes - Iteration 2
- In the output table, I would like to insert two new rows after Row 6
- Row 7
  - Column 1 HMF
  - Column 2 Harbor Maintenance Fee
  - Column 3
  - Column 4 = Enterted Value x 0.125% (in $ with two decimal points)
- Row 8
  - Column 1 MPF
  - Column 2 Merchandise Processing Fee
  - Column 3
  - Column 4 Calculation
      - MPF Calculated Value = Enterted Value x 0.3464%
      - Min = $33.58
      - Max = $651.50
      - If the MPF Calculated Value < Min then use Min
      - If the MPF Calulcated Value > Max then use Max
- The old Row 7 becomes Row 9

## Remove Container Utilization
* Remove the container utilization output from the bottom, it is not needed for the end user consumption

# Customer Changes - 31st Aug - LCE-47

## Home Page Changes
I want you to go look at the home page in /home/umairmunir/code/LCE/DEMOS/lce-mgx-demo.git/develop and copy it across to this codebase as well

## Change the output duties table - Plan Mode
* I would like you to output the duties table and its logic

## Add an ITEM Table
I would like you to add a table before the DUTIES table. It should have the following functionality:

* Heading of the table = DUTIES - ITEM
* I would like you to do the calcultions in this table according to one item

## Change PDF File Name Format
* Change the PDF file name to include the time stamp also

## Remove the Duties Table

## Duties Table Changes
* Rename the last row column one to Total Duties
* Add a seperate box underneath the table after a line which is Duty Per Item, you can look at the format in the /home/umairmunir/code/LCE/DEMOS/lce-mgx-demo.git/develop
* Make the font of total duties (Last Row) the same size as the rest of the rows but bold
* Remove the line * Does not include EXCISE TAX
* Make the amount in the highlighted box Duty Per Item to 2 decimal points

## Product Input Page Changes
I want the following changes made to the product input page

* Move the ITEM LANDED COST (PER UNIT) to the bottom before the Export PDF CTA
* Remove the Export PDF CTA from the mid right side middle

## Product Input Page Changes - DUTIES - ITEM Table
I want the following changes made to the output table labelled DUTIES - ITEM
* In Row 1 Column 1, change the label to Customs Unit of Measure

## PDF Re-factor
Let's refactor the PDF export. I want you to remove all the code that is generating the PDF export. Let me know once that is done

### PDF - Refactor
* Create a new PDF file with the following structure
* Header
  * H1 - Trade Facilitators, INC.
  * H2 - TOTAL LANDED COST
  * Normal Text - Generated on: Date and Time Stamp
* H2 - Product Information

  Item Number: <As per system>
  Name/Description: <As per system>
  HTS Code: <As per sys*tem>
  Country of Origin: <As per system>
  Unit Cost: <As per system>
  Container: <As per system>
  Maximum Units in Container: <As per system>

* Replicate the output from the web (same as displayed when Calculate Total Landed Cost is clicked). Mimic the same logic and try to achieve the same UI
* The generated PDF files should be named as TLC_Calculation_<Name/Description>_GeneratedDate-Time

## PDF Changes
* Remove the footer from the PDF
* Start a new page if one page is not enough
* Freight Per Item should have the same border and shading as Duty Per Item
* Total Landed Cost also needs to be included at the end of the PDF as the final highlighted section
