# Testing Excel Support

## Prerequisites

1. Install the xlsx library: `npm install xlsx`
2. Make sure your development server is running: `npm run dev`

## Test Scenarios

### 1. Single Sheet Excel File

- Create a simple Excel file with one sheet
- Upload it and verify it loads automatically
- Check that no sheet selector appears

### 2. Multi-Sheet Excel File

- Create an Excel file with multiple sheets (e.g., "Sheet1", "Sheet2", "Data")
- Upload it and verify the sheet selector appears
- Test switching between sheets
- Verify data changes when switching sheets

### 3. Different Excel Formats

- Test `.xlsx` files (modern Excel format)
- Test `.xls` files (legacy Excel format)
- Test `.xlsm` files (Excel with macros)

### 4. Edge Cases

- Empty Excel files
- Files with empty sheets
- Files with very long sheet names
- Files with special characters in sheet names

## Sample Test Data

### Sheet 1: Users

| ID  | Name        | Email            | Role  |
| --- | ----------- | ---------------- | ----- |
| 1   | John Doe    | john@example.com | Admin |
| 2   | Jane Smith  | jane@example.com | User  |
| 3   | Bob Johnson | bob@example.com  | User  |

### Sheet 2: Products

| ProductID | ProductName | Price  | Category    |
| --------- | ----------- | ------ | ----------- |
| P001      | Laptop      | 999.99 | Electronics |
| P002      | Mouse       | 29.99  | Accessories |
| P003      | Keyboard    | 79.99  | Accessories |

### Sheet 3: Orders

| OrderID | CustomerID | ProductID | Quantity | Date       |
| ------- | ---------- | --------- | -------- | ---------- |
| O001    | 1          | P001      | 1        | 2024-01-15 |
| O002    | 2          | P002      | 2        | 2024-01-16 |
| O003    | 3          | P003      | 1        | 2024-01-17 |

## Expected Behavior

### File Upload

- Excel files should be accepted
- Loading indicator should appear
- File information should display correctly

### Sheet Detection

- Single sheet: No selector, data loads immediately
- Multiple sheets: Selector appears with all sheet names
- Current sheet should be highlighted

### Sheet Switching

- Loading indicator should appear during switch
- Data should update to show new sheet content
- Headers should update accordingly
- Pagination should reset to page 1

### Data Display

- Headers should be properly parsed
- Data should be displayed in table format
- Pagination should work correctly
- Empty cells should show as "-"

## Troubleshooting

### Common Issues

1. **"Cannot find module 'xlsx'"**

   - Solution: Run `npm install xlsx`

2. **File not loading**

   - Check browser console for errors
   - Verify file format is supported
   - Check file size (very large files may timeout)

3. **Sheet selector not appearing**

   - Verify Excel file has multiple sheets
   - Check if sheet names are properly set
   - Look for console errors

4. **Data not displaying correctly**
   - Check if first row contains headers
   - Verify sheet has data in expected format
   - Check for empty or corrupted cells

## Performance Testing

### File Size Limits

- Test with small files (< 1MB)
- Test with medium files (1-10MB)
- Test with large files (> 10MB)

### Response Times

- File upload and parsing
- Sheet switching
- Pagination navigation

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Next Steps After Testing

1. Verify all functionality works as expected
2. Test with real-world Excel files
3. Gather user feedback
4. Consider performance optimizations
5. Plan additional features (export, validation, etc.)
