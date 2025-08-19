# UI Changes
These UI changes are being done based on the customer feedback received until Friday 15 Aug 2025. The changes are being done using Claud Code

## Overall UI Changes
* The font needs to be changed to *Poppins San-Serif*
* The main colour need to be hex 0E4A7E
* All pages need to have the logo on the top left side in the header. The logo file is called "TFINewLogo.jpeg"

## UI Refinements
* Please attached screenshot "section-line.png". When the input box is saved, it has a strange straight line at the bottom which is causing two issues. First, it is doubling the existing border and secondly it is runing the rounded edges at the bottom of the rectangle

## UI Refinements - 2nd Iteration
* If the user misses an input, the section missing the input is not highlighted properly with enough emphasis, please give me options on how to fix this

## UI Refinements - 3rd Iteration
* The TFI logo is looking really small and not really impactful. Can you suggest different options to make it more visible

## UI Refinements - 4th Iteration
* Let's try a different approach for TFI logo placement. I want to try place the logo in the middle of the header. Give me some options with this approach

## UI Refinements - 5th Iteration
* Let's replace the TFI logo with "tfi-2024-logo.svg"

## UI Refinements - 6th Iteration
* The logo in the header needs space above and below

## UI Refinements - 7th Iteration
Row 2 - Entered Value
    - Column 1: "Entered Value" (label)
    - Column 2: Empty
    - Column 3: Empty
    - Column 4: ${enteredValue} (formatted currency)
Row 3 - HTS Code
    - Column 1: {htsCode} (dynamic HTS code like "2204.21.50.40") - Text formatting needs to match other rows in the same column
    - Column 2: "Base HTS Code Duty" (duty type)
    - Column 3: Rate (e.g., "6.3 c/l" or "19.8 c/l")
    - Column 4: ${baseHtsDutyAmount} (calculated duty amount)