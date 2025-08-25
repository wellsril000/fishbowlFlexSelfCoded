# Excel Flow Explanation - How It Works

## 🎯 **New User Flow**

Instead of handling everything on one page, we now have a cleaner, step-by-step approach:

1. **Home Page** → User uploads file
2. **Sheet Selection** → If Excel has multiple sheets, user picks one
3. **Preview Page** → Shows the selected sheet's data

## 📁 **Files and Their Roles**

### 1. `FileUploadBox.tsx` - The Smart Router
```typescript
// This is the key logic that decides where to send the user
if (file.name.toLowerCase().endsWith('.csv')) {
  // CSV files go directly to preview
  navigate("/preview", { state: { file: file } });
} else {
  // Excel files go to sheet selection first
  navigate("/sheet-selection", { state: { file: file } });
}
```

**What it does:**
- Checks file type
- Routes CSV files directly to preview
- Routes Excel files to sheet selection

### 2. `SheetSelection.tsx` - The Sheet Picker
```typescript
// This function analyzes the Excel file
const analyzeExcelFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetNames = workbook.SheetNames;
  
  if (sheetNames.length === 1) {
    // Only one sheet - skip selection, go straight to preview
    navigate("/preview", { 
      state: { file: file, selectedSheet: sheetNames[0], workbook: workbook } 
    });
  } else {
    // Multiple sheets - show selection interface
    setAvailableSheets(sheetNames);
  }
};
```

**What it does:**
- Reads the Excel file
- Counts how many sheets it has
- If only 1 sheet: automatically goes to preview
- If multiple sheets: shows the selection interface

### 3. `preview.tsx` - The Data Display
```typescript
// Now much simpler - just shows the data
if (file.name.toLowerCase().endsWith(".csv")) {
  // Handle CSV files (unchanged)
} else if (file.name.toLowerCase().match(/\.(xlsx|xls|xlsm)$/)) {
  // Excel files - sheet already selected, just parse it
  if (!selectedSheet || !workbook) {
    throw new Error("Excel file data is incomplete");
  }
  parseExcelSheet(workbook, selectedSheet);
}
```

**What it does:**
- Receives the file, selected sheet, and workbook data
- No more sheet selection logic
- Just displays the data in a table

## 🔄 **Data Flow Between Pages**

### Step 1: File Upload
```typescript
// User selects file in FileUploadBox
// FileUploadBox decides where to send it
```

### Step 2: Sheet Selection (if needed)
```typescript
// SheetSelection receives: { file: File }
// SheetSelection sends to preview: { 
//   file: File, 
//   selectedSheet: string, 
//   workbook: XLSX.WorkBook 
// }
```

### Step 3: Data Preview
```typescript
// Preview receives all the data it needs
// No need to re-read the file or re-parse
```

## 💡 **Key Benefits of This Approach**

1. **Cleaner Code**: Each page has one job
2. **Better UX**: Users see exactly what they're selecting
3. **Easier Debugging**: Problems are isolated to specific pages
4. **More Maintainable**: Changes to sheet selection don't affect data display

## 🧠 **How to Think About This**

Think of it like a restaurant:

- **FileUploadBox** = Host who greets you and checks your reservation
- **SheetSelection** = Waiter who shows you the menu and takes your order
- **Preview** = Kitchen that prepares and serves your food

Each person has a specific job, and they pass information to the next person in line.

## 🔧 **What Happens When You Upload an Excel File**

1. **FileUploadBox** sees it's an Excel file → sends to SheetSelection
2. **SheetSelection** reads the file and counts sheets
3. **If 1 sheet**: automatically goes to Preview
4. **If multiple sheets**: shows selection buttons
5. **User clicks a sheet** → SheetSelection sends everything to Preview
6. **Preview** shows the data in a nice table

## 📚 **Key Concepts to Understand**

### State Management
- Each page manages its own state
- Data is passed between pages using React Router's `state` prop
- No global state needed

### File Reading
- Excel files are read as `ArrayBuffer` (binary data)
- The `xlsx` library converts this to a `Workbook` object
- We can access sheet names and data from the workbook

### Navigation
- `navigate("/path", { state: { data } })` sends data to the next page
- `location.state` receives data from the previous page

This approach is much cleaner and easier to understand than trying to do everything on one page! 