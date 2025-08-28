# UI Changes - 28 Aug 2025 - Static Version

## Home Page
* All the text on the home page need to be of color hex 0E4A7E
* The "Total Landed Cost Engine" text in the header needs to be of color hex 0E4A7E

## Product Input Page
* The "Total Landed Cost Engine" text in the header needs to be of color hex 0E4A7E

### Validation Fixes
* The unit cost field needs to only allow four decimal points
* For master pack dimensions, allow two decimal points in L X W X H fields
* For Master Pack Weight allow two decimal points
* Items per master pack, allow whole numbers
* For freight cost allow whole numbers

### Iteration 2 Fixes
* The text of Calculate Total Landed Costs button should be Calculate Total Landed Cost
* The export PDF button needs to use the same colour as the calculate total landed cost button
* In the duties output table, please add the percentages in column 3 and show that in the last row column 3. Use the same text style as the rest of the row

### Iteration 3 Fixes
* In the duties output table, please add the percentages in column 3 for row 2,3,4,5 and show that in the last row column 3. Use the same text style as the rest of the row
* Don't show the percentages in column 3, rows 6,7

### Iteration 4 Fixes - Duties Output Table

Make the following changes and test using Playwright

* In row 1 column 4, use the number format xxx,xxx,xxx
* Remove the percentage in row 2, column 3
* The percentage addition in row 7, column 3 is the sum of percentages in row 3-6 (DO NOT INCLUDE ANYHTING ELSE). Round the output to 0 decimal points
* Round the amounts in column 4 to 0 decimal points

### Iteration 5 Fixes

* There is a UX bug in the product-input page, when we complete the inputs in Units and Dimensions section. The view jumps into the middle of next section and not the start. Use playwright if you need to capture this and fix this. Test using playwright




