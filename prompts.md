Let's continue with our development.

# User Inputs - Sections
I would like an interactive design for user inputs, which is single page. However, it needs to be have different sections. The sections should flow one after the other and the filled sections should collapse.

## Section 1 - Name to be decided
### Inputs

- Name/ID - Text Field, user input
- HTS Code - 10 Digits Number, following the format xxxx.xx.xx.xx. The first digit cannot be 0
- Country of Origin - This is a drop box, fill this with ISO codes of all countries and their flags
- Unit Cost - This will be in US Dollars. Allow up to four decimal points


Let's continue building the user input. 

## Section 2 - Item Details
### Inputs
- Description - This is no an input but a display of the HS Code from the last section, we will later use this to display the description
- Number of Wine Cases (Item Quantity per Container) - This cannot be a decimal number or 0 or more than 1260

I wanted some functional changes:

- I want to have the following countries with their flags and ISO codes in the "Country of Origin" Field 
    - France
    - Italy
    - Portugal
    - Spain

## Section 3 - Shipment Details
### Inputs
- Container Size - Drop Down with one option
    - 40 Feet
- Incoterms - This field is used to input the Incoterms also known as Incoterms, or International Commercial Terms. This will be a drop down with two options:
    - EXW (EX Works)
    - FCA (Free Carrier)
    - FOB (Free on Board)
- Origin Port - Drop Down with options:
    - Le Havre (FR)
    - Livorno (IT)
    - Leixões (PT)
    - Barcelona (ES)
- Destination Port - Drop Down with options:
    - New York (US)
    - New Jersey (US)

I would like to build the following additional logic:

- For "Origin Port", only display the ports that are present in the "Country of Origin". For example:
    - France - Le Havre (FR)
    - Italy - Livorno (IT)
    - Portugal - Leixões (PT)
    - Spain - Barcelona (ES)

Once the third section is saved, a button should be displayed to "Calculate Total Landed Costs"

## Section 3 - Shipment Details (Updated)
### Inputs
- Container Size - Drop Down with one option
    - 40 Feet
- Incoterms - This field is used to input the Incoterms also known as Incoterms, or International Commercial Terms. This will be a drop down with two options:
    - EXW (EX Works)
    - FCA (Free Carrier)
    - FOB (Free on Board)
- Origin Port - Drop Down with options:
    - Le Havre (FR)
    - Livorno (IT)
    - Leixões (PT)
    - Barcelona (ES)
- Destination Port - Drop Down with options:
    - New York (US)
    - New Jersey (US)
- Create a horizontal line to start a sub-section with the heading "Freight Charges"
### Freight Charges subsection
- This section will present the user with a toggle to "Use Index Rates"
- If Index Rates is used, use the following rates:
    - France - $6000
    - Italy - $6100
    - Portugal - $6200
    - Spain - $6300
- If the user opts to not use Index Rates, please give a field for input of Freight

# Landed Costs Results
Once the user clicks on the Calcualte Total Landed Costs button, we need to display the results at the bottom of the page

## Design
- The results will comprise of multiple sections as well
- The sections will be organised in shaded rectangles as (see the attached screenshot for inspiration)
- The boxes will be organised in a grid

## Box 1, HERO Box - Landed Cost per item
This is the most important information that needs to be conveyed to the user. Leave it empty for the time being

## Box 2, Customs Calculation
- Customs Units - Calculated via the formula
    - Number of Wine Cases x 12 x .75 (this calculation will be displayed in litre)
- Customs Value - $ - Calculated via the formula
    - Number of Wine Cases x Unit Cost (this calculation will be displayed in USD)
- HTS Code Duty Percentages
    - Display HTS Code
- Custom Duty per Item (displayed in USD)
    - Put $2.00 as a placeholder

## Box 3, Freight Costs
- Origin Port Name (2 Digit Country Code) to Destination Port Name (2 Digit Country Code)
- Total Freight Costs   
    - Use Index Rates or User Input Field for this
- Freight Charges per Item (displayed in USD)
    - Total Freight Costs/Number of Wine Cases

TUE - 12 Aug 2025

I need some changes done.

# Product Details Section
- Insert a new field in the start called "Item Number". This should also alphanumeric inputs
- Change the Field named "Product Name/ID" to "Item Name/Description" 
- In the "HTS Code" field, I would like to have a drop box with two imputs
    1. 2204.21.50.40
    2. 2204.10.00.75

# Units and Dimensions Section
- Change the title of the field "Description" to "HTS Code Description". In this field, display the the text associated with the HTS Code entered in the previous section. The Data is below:
    1. 2204.21.50.40 - Wine > Red > Not Certified Organic
    2. 2204.10.00.75 - Wine > Sparkling

# Shipment Details Section
- Change the "Incoterms" field helper text to "Select Incoterms Rule" from "Select Incoterms" 
- In the "Incoterms" field change the inputs to:
    1. FCA (Supplier Facility)
    2. FCA (Port of Loading)
- I want to the user two options here to either "Use Index Rates" or "Use My Rate". If the user selects "Use Index Rates" follow the same logic and populate the Index Rates. If the user selects "Use My Rate", give the user the input box to enter their rate

# Landed Costs Results - Changes

## Box 1, HERO Box - Landed Cost per item
- Make this box full width
- Make the heading "ITEM LANDED COST"
- The cost will be in USD
- Leave it empty for the time being

## Box 2, Customs Calculation
- Customs Units - Change this to "Unit of Measure"
- Customs Value - Change this to "Entered Value"
- Custom Duty per Item - Change this to "Duty per Item"

## Box 3, Freight Costs
- Change from "Origin Name (2 Digit Country Code) to Destination Port Name (2 Digit Country Code)" to Origin Country (Name) to Destination Country (Name)

TUE - 12 Aug 2025 - CUSTOMS DUTY CALC

I would like to build the business logic for calculation of the customs duty part of this calculation

## Customs Calculation - Business Logic

### Customs Calculation - Chapter 22 Codes and EU Countries
- For EU Countries the rate of duty is 15% cumulative on the "Entered Value"
- The 15% is broken down as follows:
    15% Amount = Base HTS Code Duty + Chapter 99 Duty
- The Base HTS Code Duty is calulated as follows:
    1. 2204.21.50.40 - 6.3 cents per liter x Unit of Measure 
    2. 2204.10.00.75 - 19.8 cents per liter x Unit of Measure
- Calculate the Chapter 99 Duty using the following:
    Chapter 99 Duty = (15% x Entered Value) -  Base HTS Code Duty
    Chapter 99 Duty Percentage = (Chapter 99 Duty/Entered Value) * 100

## Box 2, Customs Calculation changes post business logic

- Change the design of this to full width
- The heading of this should be "CUSTOMS AND DUTIES"
- Build a table with 4 rows and 4 columns (no border)

### Table Contents
ROW 1 - Unit of Measure (Col 1) - Output (Col 4)
ROW 2 - Entered Value (Col 1) - Base HTS Code Duty (Col2) - Base HTS Code Duty Amount in USD (Col 4)
ROW 3 - 9903.02.20 (Col 1) - IEEPA European Union - <15% base duty (Col 2) - Output of Chapter 99 Duty Percentage (Col 3) - Output of Chapter 99 Duty (Col 4)
ROW 4 - Total Customs & Duties (Col 1) - Base HTS Code Duty + Chapter 99 Duty (Col 4)

### Box 2 Highlight
- This should be displayed in a fashion that makes it stand out - give a visual line break before
- Duty Per Item using the formula
    Total Customs & Duties/Number of Wine Cases

CHANGES - Post 12 Aug Call

I need to make the following changes:

- Change the label of "Incoterms" to "Incoterms Rule"

## Box 2 Changes

### Table Contents
ROW 1 - Unit of Measure (Col 1) - Liters (Col 3) - Output (Col 4)
ROW 2 - Entered Value (Col 1) - Base HTS Code Duty (Col2) - Base HTS Code Duty Amount in USD (Col 4)
ROW 3 - HTS Code (Col 1) - Base HTS Code Duty (Col 2) - Output "6.3 c/l" if HTS = 2204.21.50.40 else Output "19.8 c/l" (Col 3) - Base HTS Code Duty Amount in USD (Col 4)  
ROW 4- 9903.02.20 (Col 1) - IEEPA European Union - <15% base duty (Col 2) - Output of Chapter 99 Duty Percentage (Col 3) - Output of Chapter 99 Duty (Col 4)











