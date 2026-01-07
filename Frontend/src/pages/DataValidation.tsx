import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import ExcelJS from "exceljs";
import { createFileImport, getImportData } from "../services/fileImports";

// Constants for address parsing
const US_COUNTRIES = [
  "usa",
  "united states",
  "u.s.a",
  "us",
  "u.s",
  "united states of america",
];
const FOREIGN_COUNTRIES = [
  "argentina",
  "australia",
  "austria",
  "belgium",
  "brazil",
  "canada",
  "chile",
  "china",
  "colombia",
  "costa rica",
  "croatia",
  "czech republic",
  "denmark",
  "dominican republic",
  "egypt",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "iceland",
  "india",
  "indonesia",
  "ireland",
  "israel",
  "italy",
  "japan",
  "kenya",
  "luxembourg",
  "malaysia",
  "mexico",
  "morocco",
  "netherlands",
  "new zealand",
  "norway",
  "peru",
  "philippines",
  "poland",
  "portugal",
  "qatar",
  "russia",
  "saudi arabia",
  "singapore",
  "south africa",
  "south korea",
  "spain",
  "sweden",
  "switzerland",
  "thailand",
  "turkey",
  "united arab emirates",
  "united kingdom",
  "vietnam",
  "uk",
  "hong kong",
  "puerto rico",
  "guam",
];

const US_STATES = [
  { state: "alabama", abbreviation: "al" },
  { state: "alaska", abbreviation: "ak" },
  { state: "arizona", abbreviation: "az" },
  { state: "arkansas", abbreviation: "ar" },
  { state: "california", abbreviation: "ca" },
  { state: "colorado", abbreviation: "co" },
  { state: "connecticut", abbreviation: "ct" },
  { state: "delaware", abbreviation: "de" },
  { state: "florida", abbreviation: "fl" },
  { state: "georgia", abbreviation: "ga" },
  { state: "hawaii", abbreviation: "hi" },
  { state: "idaho", abbreviation: "id" },
  { state: "illinois", abbreviation: "il" },
  { state: "indiana", abbreviation: "in" },
  { state: "iowa", abbreviation: "ia" },
  { state: "kansas", abbreviation: "ks" },
  { state: "kentucky", abbreviation: "ky" },
  { state: "louisiana", abbreviation: "la" },
  { state: "maine", abbreviation: "me" },
  { state: "maryland", abbreviation: "md" },
  { state: "massachusetts", abbreviation: "ma" },
  { state: "michigan", abbreviation: "mi" },
  { state: "minnesota", abbreviation: "mn" },
  { state: "mississippi", abbreviation: "ms" },
  { state: "missouri", abbreviation: "mo" },
  { state: "montana", abbreviation: "mt" },
  { state: "nebraska", abbreviation: "ne" },
  { state: "nevada", abbreviation: "nv" },
  { state: "new hampshire", abbreviation: "nh" },
  { state: "new jersey", abbreviation: "nj" },
  { state: "new mexico", abbreviation: "nm" },
  { state: "new york", abbreviation: "ny" },
  { state: "north carolina", abbreviation: "nc" },
  { state: "north dakota", abbreviation: "nd" },
  { state: "ohio", abbreviation: "oh" },
  { state: "oklahoma", abbreviation: "ok" },
  { state: "oregon", abbreviation: "or" },
  { state: "pennsylvania", abbreviation: "pa" },
  { state: "rhode island", abbreviation: "ri" },
  { state: "south carolina", abbreviation: "sc" },
  { state: "south dakota", abbreviation: "sd" },
  { state: "tennessee", abbreviation: "tn" },
  { state: "texas", abbreviation: "tx" },
  { state: "utah", abbreviation: "ut" },
  { state: "vermont", abbreviation: "vt" },
  { state: "virginia", abbreviation: "va" },
  { state: "washington", abbreviation: "wa" },
  { state: "west virginia", abbreviation: "wv" },
  { state: "wisconsin", abbreviation: "wi" },
  { state: "wyoming", abbreviation: "wy" },
];

const CITIES = [
  "montgomery",
  "juneau",
  "phoenix",
  "little rock",
  "sacramento",
  "denver",
  "hartford",
  "dover",
  "tallahassee",
  "atlanta",
  "honolulu",
  "boise",
  "springfield",
  "indianapolis",
  "des moines",
  "topeka",
  "frankfort",
  "baton rouge",
  "augusta",
  "annapolis",
  "boston",
  "lansing",
  "saint paul",
  "jackson",
  "jefferson city",
  "helena",
  "lincoln",
  "carson city",
  "concord",
  "trenton",
  "santa fe",
  "albany",
  "raleigh",
  "bismarck",
  "columbus",
  "oklahoma city",
  "salem",
  "harrisburg",
  "providence",
  "columbia",
  "pierre",
  "nashville",
  "austin",
  "salt lake city",
  "montpelier",
  "richmond",
  "olympia",
  "charleston",
  "madison",
  "cheyenne",
];

interface DataValidationProps {}

const DataValidation: React.FC<DataValidationProps> = () => {
  const location = useLocation();
  const { getToken } = useAuth();
  const {
    file,
    selectedSheet,
    workbook,
    data: initialData,
    headers: initialHeaders,
    importType,
    projectId,
  } = location.state || {};

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [isParsing, setIsParsing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [addressesParsed, setAddressesParsed] = useState(false);
  const [parsingErrors, setParsingErrors] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    longNames: number[];
    invalidStates: number[];
    invalidForeignStates: number[];
    longFirstColumn: number[]; // For PPVP validation
    matchingVendorNames: number[]; // Customer names that match vendor names
    invalidVendors: number[]; // PPVP vendors that don't exist in vendor file
  }>({
    longNames: [],
    invalidStates: [],
    invalidForeignStates: [],
    longFirstColumn: [],
    matchingVendorNames: [],
    invalidVendors: [],
  });

  useEffect(() => {
    console.log("DataValidation useEffect triggered:", {
      file,
      workbook,
      selectedSheet,
      initialData,
      initialHeaders,
    });

    // If we have initial data from the preview page, use it directly
    if (initialData && initialHeaders) {
      console.log("Using initial data from preview page");
      setHeaders(initialHeaders);
      setData(initialData);
    } else if (file && workbook) {
      // Fallback: parse the workbook if no initial data
      parseFile();
    } else if (file) {
      // Fallback: parse CSV file if no initial data
      parseFile();
    }
  }, [file, workbook, initialData, initialHeaders]);

  const parseFile = async () => {
    try {
      console.log("parseFile called with:", { file, workbook, selectedSheet });
      let parsedData: string[][] = [];

      if (file.type === "text/csv") {
        // Handle CSV files
        const text = await file.text();
        const lines = text.split("\n");
        parsedData = lines.map((line: string) => line.split(","));
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        // Handle Excel files using exceljs
        const arrayBuffer = await file.arrayBuffer();
        const newWorkbook = new ExcelJS.Workbook();
        await newWorkbook.xlsx.load(arrayBuffer);

        const sheetName = selectedSheet || newWorkbook.worksheets[0].name;
        const worksheet = newWorkbook.getWorksheet(sheetName);

        if (worksheet) {
          parsedData = [];

          // Get all rows
          worksheet.eachRow((row) => {
            const rowData: string[] = [];
            row.eachCell({ includeEmpty: true }, (cell) => {
              // Get cell value, handling different types
              let cellValue = "";
              if (cell.value !== null && cell.value !== undefined) {
                if (typeof cell.value === "object" && "text" in cell.value) {
                  cellValue = cell.value.text;
                } else if (
                  typeof cell.value === "object" &&
                  "richText" in cell.value
                ) {
                  cellValue = cell.value.richText
                    .map((rt: any) => rt.text)
                    .join("");
                } else {
                  cellValue = String(cell.value);
                }
              }
              rowData.push(cellValue);
            });
            parsedData.push(rowData);
          });
        }
      }

      console.log("Parsed data:", parsedData);

      if (parsedData.length > 0) {
        setHeaders(parsedData[0]);
        setData(parsedData.slice(1));
        console.log("Data set successfully");
      } else {
        console.error("No data found in file");
      }
    } catch (err) {
      console.error("Error parsing file:", err);
    }
  };

  const findColumnIndex = (columnName: string): number => {
    return headers.findIndex(
      (header) =>
        header.toLowerCase().trim() === columnName.toLowerCase().trim()
    );
  };

  // Ensure we always add a "Name Length Issue" column as the first column
  // so it's next to the Name column (it never exists in the original file).
  // Only for Customer and Vendor import types
  useEffect(() => {
    const isCustomerOrVendor =
      importType && ["customer", "vendor"].includes(importType.toLowerCase());

    if (!isCustomerOrVendor || !headers.length || !data.length) return;

    // If it's already the first column, do nothing
    if (headers[0] && headers[0].toLowerCase().trim() === "name length issue") {
      return;
    }

    // Otherwise, prepend the column and an empty cell for each row
    const updatedHeaders = ["Name Length Issue", ...headers];
    const updatedData = data.map((row) => ["", ...row]);
    setHeaders(updatedHeaders);
    setData(updatedData);
  }, [headers, data, importType]);

  // Ensure we always add a "First Column Length Issue" column as the first column
  // for PPVP import type (it never exists in the original file).
  useEffect(() => {
    const isPPVP = importType && importType.toLowerCase() === "ppvp";

    if (!isPPVP || !headers.length || !data.length) return;

    // If it's already the first column, do nothing
    if (
      headers[0] &&
      headers[0].toLowerCase().trim() === "first column length issue"
    ) {
      return;
    }

    // Otherwise, prepend the column and an empty cell for each row
    const updatedHeaders = ["First Column Length Issue", ...headers];
    const updatedData = data.map((row) => ["", ...row]);
    setHeaders(updatedHeaders);
    setData(updatedData);
  }, [headers, data, importType]);

  const parseAddresses = async () => {
    setIsParsing(true);
    setParsingErrors([]);

    try {
      // Check if importType is customer or vendor
      if (
        !importType ||
        !["customer", "vendor"].includes(importType.toLowerCase())
      ) {
        alert("Address parsing only available for Customer or Vendor imports");
        setIsParsing(false);
        return;
      }

      // Find required columns
      const addressColIndex = findColumnIndex("Address");
      const cityColIndex = findColumnIndex("City");
      const stateColIndex = findColumnIndex("State");
      const zipColIndex = findColumnIndex("Zip");
      const countryColIndex = findColumnIndex("Country");

      if (addressColIndex === -1) {
        alert("Unable to recognize address column");
        setIsParsing(false);
        return;
      }

      if (
        cityColIndex === -1 ||
        stateColIndex === -1 ||
        zipColIndex === -1 ||
        countryColIndex === -1
      ) {
        alert("Required columns not found: City, State, Zip, or Country");
        setIsParsing(false);
        return;
      }

      // Prepare data for API call
      const addresses = data
        .map((row, index) => ({
          row_id: index,
          address: row[addressColIndex] || "",
          original_row_data: Object.fromEntries(
            headers.map((header, i) => [header, row[i] || ""])
          ),
        }))
        .filter((item) => item.address.trim() !== ""); // Filter empty addresses

      // Call backend API
      const response = await fetch(`${API_BASE_URL}/parse-addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          import_type: importType.toLowerCase(),
          addresses: addresses,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      // Update data with parsed results
      const newData = [...data];
      const errors: number[] = [];

      result.results.forEach((parsedResult: any) => {
        const rowIndex = parsedResult.row_id;
        if (rowIndex < newData.length) {
          const row = [...newData[rowIndex]];

          if (parsedResult.success && parsedResult.parsed_address) {
            // Update columns with parsed address components
            if (cityColIndex !== -1) {
              row[cityColIndex] = parsedResult.parsed_address.city || "";
            }
            if (stateColIndex !== -1) {
              row[stateColIndex] = parsedResult.parsed_address.state || "";
            }
            if (zipColIndex !== -1) {
              row[zipColIndex] = parsedResult.parsed_address.zip || "";
            }
            if (countryColIndex !== -1) {
              row[countryColIndex] = parsedResult.parsed_address.country || "";
            }

            // Update address column with parsed street
            row[addressColIndex] =
              parsedResult.parsed_address.street || row[addressColIndex];
          } else {
            // Parsing failed - add to errors
            errors.push(rowIndex);
          }

          newData[rowIndex] = row;
        }
      });

      setData(newData);
      setParsingErrors(errors);
      setAddressesParsed(true);
    } catch (err) {
      console.error("Error during address parsing:", err);
      alert(
        `Error parsing addresses: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsParsing(false);
    }
  };

  const validateData = async () => {
    setIsValidating(true);

    try {
      const nameColIndex = findColumnIndex("Name");
      const nameIssueColIndex = findColumnIndex("Name Length Issue");
      const firstColIssueIndex = findColumnIndex("First Column Length Issue");
      const stateColIndex = findColumnIndex("State");
      const countryColIndex = findColumnIndex("Country");

      const longNames: number[] = [];
      const invalidStates: number[] = [];
      const invalidForeignStates: number[] = [];
      const longFirstColumn: number[] = [];
      const matchingVendorNames: number[] = [];
      const invalidVendors: number[] = [];

      // Only validate name length for Customer and Vendor import types
      const shouldValidateNameLength =
        importType && ["customer", "vendor"].includes(importType.toLowerCase());

      // Only validate first column length for PPVP import type
      const isPPVP = importType && importType.toLowerCase() === "ppvp";
      const isCustomer = importType && importType.toLowerCase() === "customer";

      // Fetch vendor names for cross-validation (if validating customer or PPVP)
      let vendorNames: string[] = [];
      if ((isCustomer || isPPVP) && projectId) {
        try {
          const token = await getToken();
          const importData = await getImportData(projectId, "vendor", token);

          // Extract vendor names from import data
          for (const dataItem of importData) {
            if (dataItem.data_type === "names") {
              vendorNames = dataItem.values.map((v) => v.toLowerCase().trim());
              break;
            }
          }
        } catch (err) {
          console.error("Error fetching vendor names:", err);
          // Continue validation even if fetch fails
        }
      }

      // Work on a copy so we can safely update cells (e.g. Name Length Issue column)
      const updatedData = data.map((row) => [...row]);

      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = updatedData[rowIndex];

        // Check Name column for cells over 41 characters (Customer/Vendor only)
        if (
          shouldValidateNameLength &&
          nameColIndex !== -1 &&
          row[nameColIndex] &&
          row[nameColIndex].length > 41
        ) {
          longNames.push(rowIndex);

          // Set flag text in the Name Length Issue column so it appears in the grid/export
          if (nameIssueColIndex !== -1) {
            row[nameIssueColIndex] = "Name longer than 41 characters";
          }
        }

        // Check if customer name matches vendor name (Customer only)
        if (
          isCustomer &&
          nameColIndex !== -1 &&
          row[nameColIndex] &&
          vendorNames.length > 0
        ) {
          const customerName = row[nameColIndex].toLowerCase().trim();
          if (customerName && vendorNames.includes(customerName)) {
            matchingVendorNames.push(rowIndex);
          }
        }

        // Check first column for cells over 70 characters (PPVP only)
        // First column is index 1 because index 0 is the "First Column Length Issue" column
        if (isPPVP && row.length > 1) {
          const firstColumnValue = row[1]; // Skip the issue column at index 0
          if (firstColumnValue && firstColumnValue.length > 70) {
            longFirstColumn.push(rowIndex);

            // Set flag text in the First Column Length Issue column
            if (firstColIssueIndex !== -1) {
              row[firstColIssueIndex] = "Part number longer than 70 characters";
            }
          }

          // Check if PPVP vendor exists in vendor file
          if (vendorNames.length > 0) {
            const vendorColIndex =
              findColumnIndex("Vendor") !== -1
                ? findColumnIndex("Vendor")
                : findColumnIndex("Vendor Name") !== -1
                ? findColumnIndex("Vendor Name")
                : findColumnIndex("Supplier") !== -1
                ? findColumnIndex("Supplier")
                : -1;

            if (vendorColIndex !== -1 && row[vendorColIndex]) {
              const ppvpVendor = row[vendorColIndex].toLowerCase().trim();
              if (ppvpVendor && !vendorNames.includes(ppvpVendor)) {
                invalidVendors.push(rowIndex);
              }
            }
          }
        }

        // Check State column for non-US states when country is U.S.
        if (stateColIndex !== -1 && countryColIndex !== -1) {
          const state = row[stateColIndex];
          const country = row[countryColIndex];

          if (country && US_COUNTRIES.includes(country.toLowerCase())) {
            // US country, check if state is valid US state
            const isValidUSState = US_STATES.some(
              (s) =>
                s.state === state.toLowerCase() ||
                s.abbreviation === state.toLowerCase()
            );

            if (!isValidUSState) {
              invalidStates.push(rowIndex);
            }
          } else if (country && !US_COUNTRIES.includes(country.toLowerCase())) {
            // Foreign country, check if state is in valid foreign states list
            // TODO: Add foreign state validation when you provide the list
            // For now, we'll skip this validation
          }
        }
      }

      // Save any updates we made to the data (e.g. Name Length Issue flags)
      setData(updatedData);
      setValidationErrors({
        longNames,
        invalidStates,
        invalidForeignStates,
        longFirstColumn,
        matchingVendorNames,
        invalidVendors,
      });
    } catch (err) {
      console.error("Error during data validation:", err);
      alert("An error occurred during data validation");
    } finally {
      setIsValidating(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportToExcel = async () => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      // Prepare data with headers
      const exportData = [headers, ...data];

      // Add all rows to the worksheet
      exportData.forEach((row, rowIndex) => {
        const excelRow = worksheet.addRow(row);

        // Apply styling to header row
        if (rowIndex === 0) {
          excelRow.font = { bold: true };
          excelRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" }, // Light gray background
          };
        }
      });

      // Apply red background to cells with validation errors
      const nameColIndex = findColumnIndex("Name");
      if (nameColIndex !== -1 && validationErrors.longNames.length > 0) {
        validationErrors.longNames.forEach((rowIndex) => {
          // Excel rows are 1-indexed, row 1 is headers, data starts at row 2
          const excelRow = rowIndex + 2;
          const cell = worksheet.getCell(excelRow, nameColIndex + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
        });
      }

      // Apply red background to PPVP first column validation errors
      if (validationErrors.longFirstColumn.length > 0) {
        // First column is at index 1 (skip the issue column at index 0)
        const firstColIndex = 1;
        validationErrors.longFirstColumn.forEach((rowIndex) => {
          const excelRow = rowIndex + 2; // +2 because row 1 is headers
          const cell = worksheet.getCell(excelRow, firstColIndex + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
        });
      }

      // Apply orange background to invalid state cells
      const stateColIndex = findColumnIndex("State");
      if (stateColIndex !== -1 && validationErrors.invalidStates.length > 0) {
        validationErrors.invalidStates.forEach((rowIndex) => {
          const excelRow = rowIndex + 2;
          const cell = worksheet.getCell(excelRow, stateColIndex + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE699" }, // Light orange background
          };
        });
      }

      // Apply red background to parsing error cells
      const addressColIndex = findColumnIndex("Address");
      if (addressColIndex !== -1 && parsingErrors.length > 0) {
        parsingErrors.forEach((rowIndex) => {
          const excelRow = rowIndex + 2;
          const cell = worksheet.getCell(excelRow, addressColIndex + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
        });
      }

      // Apply red background to customer names that match vendor names
      if (
        nameColIndex !== -1 &&
        validationErrors.matchingVendorNames.length > 0
      ) {
        validationErrors.matchingVendorNames.forEach((rowIndex) => {
          const excelRow = rowIndex + 2;
          const cell = worksheet.getCell(excelRow, nameColIndex + 1);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
        });
      }

      // Apply red background to PPVP vendors that don't exist in vendor file
      if (validationErrors.invalidVendors.length > 0) {
        const vendorColIndex =
          findColumnIndex("Vendor") !== -1
            ? findColumnIndex("Vendor")
            : findColumnIndex("Vendor Name") !== -1
            ? findColumnIndex("Vendor Name")
            : findColumnIndex("Supplier") !== -1
            ? findColumnIndex("Supplier")
            : -1;

        if (vendorColIndex !== -1) {
          validationErrors.invalidVendors.forEach((rowIndex) => {
            const excelRow = rowIndex + 2;
            const cell = worksheet.getCell(excelRow, vendorColIndex + 1);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFC7CE" }, // Light red background
            };
          });
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `exported_data_${timestamp}.xlsx`;

      // Write and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      // Save to database if projectId is available
      if (projectId && importType) {
        try {
          const token = await getToken();

          // Extract relevant data based on import type
          const extractedData: {
            names?: string[];
            part_numbers?: string[];
            vendor_names?: string[];
          } = {};

          if (
            importType.toLowerCase() === "customer" ||
            importType.toLowerCase() === "vendor"
          ) {
            // Extract names from "Name" column
            const nameColIndex = findColumnIndex("Name");
            if (nameColIndex !== -1) {
              const names = data
                .map((row) => row[nameColIndex]?.trim())
                .filter((name) => name && name.length > 0);
              extractedData.names = names;
            }
          } else if (importType.toLowerCase() === "ppvp") {
            // Extract part numbers from first column (index 1, skip issue column at 0)
            const partNumbers = data
              .map((row) => (row.length > 1 ? row[1]?.trim() : ""))
              .filter((pn) => pn && pn.length > 0);
            extractedData.part_numbers = partNumbers;

            // Extract vendor names - try to find "Vendor" or "Vendor Name" column
            const vendorColIndex =
              findColumnIndex("Vendor") !== -1
                ? findColumnIndex("Vendor")
                : findColumnIndex("Vendor Name") !== -1
                ? findColumnIndex("Vendor Name")
                : findColumnIndex("Supplier") !== -1
                ? findColumnIndex("Supplier")
                : -1;

            if (vendorColIndex !== -1) {
              const vendorNames = data
                .map((row) => row[vendorColIndex]?.trim())
                .filter((vn) => vn && vn.length > 0);
              extractedData.vendor_names = vendorNames;
            }
          }

          // Save to database
          await createFileImport(
            {
              project_id: projectId,
              import_type: importType.toLowerCase(),
              filename: filename,
              data: extractedData,
            },
            token
          );
        } catch (dbErr) {
          console.error("Error saving to database:", dbErr);
          // Don't block the export if database save fails
        }
      }
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("An error occurred while exporting the file");
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getCellStyle = (rowIndex: number, colIndex: number) => {
    const globalRowIndex = startIndex + rowIndex;

    // Highlight parsing errors in address column
    if (parsingErrors.includes(globalRowIndex)) {
      const addressColIndex = findColumnIndex("Address");
      if (colIndex === addressColIndex) {
        return "bg-red-100";
      }
    }

    // Highlight validation errors
    if (validationErrors.longNames.includes(globalRowIndex)) {
      const nameColIndex = findColumnIndex("Name");
      if (colIndex === nameColIndex) {
        return "bg-red-100";
      }
    }

    if (validationErrors.invalidStates.includes(globalRowIndex)) {
      const stateColIndex = findColumnIndex("State");
      if (colIndex === stateColIndex) {
        return "bg-orange-100";
      }
    }

    // Highlight PPVP first column validation errors (first column is at index 1, skip issue column at 0)
    if (validationErrors.longFirstColumn.includes(globalRowIndex)) {
      if (colIndex === 1) {
        return "bg-red-100";
      }
    }

    // Highlight customer names that match vendor names
    if (validationErrors.matchingVendorNames.includes(globalRowIndex)) {
      const nameColIndex = findColumnIndex("Name");
      if (colIndex === nameColIndex) {
        return "bg-red-100";
      }
    }

    // Highlight PPVP vendors that don't exist in vendor file
    if (validationErrors.invalidVendors.includes(globalRowIndex)) {
      const vendorColIndex =
        findColumnIndex("Vendor") !== -1
          ? findColumnIndex("Vendor")
          : findColumnIndex("Vendor Name") !== -1
          ? findColumnIndex("Vendor Name")
          : findColumnIndex("Supplier") !== -1
          ? findColumnIndex("Supplier")
          : -1;
      if (colIndex === vendorColIndex) {
        return "bg-red-100";
      }
    }

    return "";
  };

  const getCellTooltip = (rowIndex: number, colIndex: number): string => {
    const globalRowIndex = startIndex + rowIndex;
    const nameColIndex = findColumnIndex("Name");

    // Show tooltip for long name cells
    if (
      validationErrors.longNames.includes(globalRowIndex) &&
      colIndex === nameColIndex
    ) {
      return "Name longer than 41 characters";
    }

    // Show tooltip for PPVP first column validation errors (first column is at index 1)
    if (
      validationErrors.longFirstColumn.includes(globalRowIndex) &&
      colIndex === 1
    ) {
      return "Part number longer than 70 characters";
    }

    // Show tooltip for customer names that match vendor names
    if (
      validationErrors.matchingVendorNames.includes(globalRowIndex) &&
      colIndex === nameColIndex
    ) {
      return "Name matches a vendor name";
    }

    // Show tooltip for PPVP vendors that don't exist in vendor file
    const vendorColIndex =
      findColumnIndex("Vendor") !== -1
        ? findColumnIndex("Vendor")
        : findColumnIndex("Vendor Name") !== -1
        ? findColumnIndex("Vendor Name")
        : findColumnIndex("Supplier") !== -1
        ? findColumnIndex("Supplier")
        : -1;
    if (
      validationErrors.invalidVendors.includes(globalRowIndex) &&
      colIndex === vendorColIndex
    ) {
      return "Vendor does not exist in vendor file";
    }

    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Data Validation
          </h1>

          {/* Action Buttons */}
          <div className="mb-6 flex justify-start space-x-4">
            {/* Only show Parse Addresses button for Customer and Vendor */}
            {importType &&
              ["customer", "vendor"].includes(importType.toLowerCase()) && (
                <button
                  onClick={parseAddresses}
                  disabled={isParsing || addressesParsed}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isParsing || addressesParsed
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isParsing ? "Parsing..." : "Parse Addresses"}
                </button>
              )}

            {/* Show Validate Data button - always available */}
            <button
              onClick={validateData}
              disabled={isValidating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isValidating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isValidating ? "Validating..." : "Validate Data"}
            </button>

            {data.length > 0 && (
              <button
                onClick={exportToExcel}
                className="px-6 py-3 rounded-lg font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700"
              >
                Export to Excel
              </button>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-center text-sm font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => {
                        const tooltip = getCellTooltip(rowIndex, colIndex);
                        return (
                          <td
                            key={colIndex}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getCellStyle(
                              rowIndex,
                              colIndex
                            )}`}
                            title={tooltip}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info Bar */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing rows {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, data.length)} of{" "}
                    {data.length.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataValidation;
