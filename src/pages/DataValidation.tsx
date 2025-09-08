import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";

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
  "agoura hills",
  "albany",
  "annapolis",
  "atlanta",
  "austin",
  "baton rouge",
  "bismarck",
  "boise",
  "boston",
  "carol stream",
  "carson city",
  "charleston",
  "cheyenne",
  "city of industry",
  "cold spring harbor",
  "columbia",
  "columbus",
  "concord",
  "coral springs",
  "daytona beach",
  "denver",
  "des moines",
  "dover",
  "el cajon",
  "fernandina beach",
  "fountain inn",
  "fort lee",
  "fort lauderdale",
  "fort mayers",
  "frankfort",
  "green bay",
  "hanover park",
  "harrisburg",
  "hartford",
  "helena",
  "holly hill",
  "honolulu",
  "indian land",
  "indianapolis",
  "jackson",
  "jefferson city",
  "juneau",
  "kansas city",
  "lake mary",
  "lake worth",
  "lansing",
  "lincoln",
  "little rock",
  "los angeles",
  "madison",
  "mint hill",
  "montgomery",
  "montpelier",
  "nantong city",
  "nashville",
  "new albany",
  "new port richey",
  "new york",
  "oklahoma city",
  "olympia",
  "ormond beach",
  "palm beach",
  "palm beach gardens",
  "philadelphia",
  "phoenix",
  "pinellas park",
  "plant city",
  "pompano beach",
  "providence",
  "raleigh",
  "rancho cordova",
  "richmond",
  "sacramento",
  "saddle brook",
  "saint louis",
  "saint paul",
  "saint petersburg",
  "salem",
  "salt lake city",
  "san antonio",
  "san diego",
  "san jose",
  "san ramon",
  "santa fe",
  "sioux falls",
  "springfield",
  "tallahassee",
  "tarpon springs",
  "topeka",
  "trenton",
  "valley stream",
  "van nuys",
  "vernon hills",
  "warren",
  "lincoln park",
];

interface DataValidationProps { }

const DataValidation: React.FC<DataValidationProps> = () => {
  const location = useLocation();
  const {
    file,
    selectedSheet,
    workbook,
    data: initialData,
    headers: initialHeaders,
  } = location.state || {};

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
  }>({ longNames: [], invalidStates: [], invalidForeignStates: [] });

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

      // If we already have a workbook (from Excel), use it directly
      if (workbook && typeof workbook === "object") {
        console.log("Using existing workbook");
        const worksheet =
          workbook.Sheets[selectedSheet || workbook.SheetNames[0]];
        console.log("Worksheet:", worksheet);

        if (worksheet && worksheet["!ref"]) {
          const range = XLSX.utils.decode_range(worksheet["!ref"]);
          console.log("Range:", range);
          parsedData = [];

          for (let row = range.s.r; row <= range.e.r; row++) {
            const rowData: string[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(cell ? String(cell.v || "") : "");
            }
            parsedData.push(rowData);
          }
        }
      } else if (file.type === "text/csv") {
        // Handle CSV files
        const text = await file.text();
        const lines = text.split("\n");
        parsedData = lines.map((line: string) => line.split(","));
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        // Handle Excel files that weren't pre-parsed
        const arrayBuffer = await file.arrayBuffer();
        const newWorkbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet =
          newWorkbook.Sheets[selectedSheet || newWorkbook.SheetNames[0]];

        if (worksheet && worksheet["!ref"]) {
          const range = XLSX.utils.decode_range(worksheet["!ref"]);
          parsedData = [];

          for (let row = range.s.r; row <= range.e.r; row++) {
            const rowData: string[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(cell ? String(cell.v || "") : "");
            }
            parsedData.push(rowData);
          }
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

  const parseAddresses = async () => {
    setIsParsing(true);
    setParsingErrors([]);

    try {
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

      const newData = [...data];
      const errors: number[] = [];

      for (let rowIndex = 0; rowIndex < newData.length; rowIndex++) {
        try {
          const row = [...newData[rowIndex]];
          const address = row[addressColIndex];

          if (!address || address.trim() === "") {
            continue; // Skip empty addresses
          }

          // Clean address for parsing (work on a copy)
          let cleanAddress = address.trim().toLowerCase();
          cleanAddress = cleanAddress.replace(/,/g, " "); // Replace commas with spaces
          cleanAddress = cleanAddress.replace(/\s+/g, " "); // Collapse whitespace
          cleanAddress = cleanAddress.replace(/[.,;!?]+$/, ""); // Remove trailing punctuation

          // Split into words and work with a mutable array
          let addressWords = cleanAddress.split(" ");
          console.log(`Row ${rowIndex}: Original address words:`, addressWords);

          // Collect per-row parsing issues for diagnostics
          const issues: string[] = [];

          // Parse Country (right to left, check 4, 3, 2, 1 words)
          let country = "";
          for (let wordCount = 4; wordCount >= 1; wordCount--) {
            if (addressWords.length < wordCount) continue;

            const lastWords = addressWords.slice(-wordCount).join(" ");
            console.log(
              `Row ${rowIndex}: Checking for country with ${wordCount} words: "${lastWords}"`
            );

            // Check US countries first
            if (US_COUNTRIES.includes(lastWords)) {
              country = lastWords;
              console.log(`Row ${rowIndex}: Found US country: "${country}"`);
              addressWords.splice(-wordCount);
              break;
            }

            // Check foreign countries
            if (FOREIGN_COUNTRIES.includes(lastWords)) {
              country = lastWords;
              console.log(
                `Row ${rowIndex}: Found foreign country: "${country}"`
              );
              addressWords.splice(-wordCount);
              break;
            }
          }

          if (country) {
            row[countryColIndex] = country;
            console.log(`Row ${rowIndex}: Country set to: "${country}"`);
          } else {
            issues.push("no country in address text");
          }

          // Parse Zip Code (check for 5-digit, 5+4, or 5+5 digit formats)
          let zip = "";
          let zipFound = false;
          if (addressWords.length > 0) {
            const lastWord = addressWords[addressWords.length - 1];
            console.log(
              `Row ${rowIndex}: Checking last word for zip: "${lastWord}"`
            );

            // Check for zip codes with hyphen (5+4 or 5+5 digits)
            if (lastWord.includes("-")) {
              if (/^\d{5}-\d{4}$/.test(lastWord)) {
                // 5+4 format (like 07981-0405)
                zip = lastWord;
                addressWords.splice(-1);
                console.log(`Row ${rowIndex}: Found 5+4 zip: "${zip}"`);
                zipFound = true;
              } else if (/^\d{5}-\d{5}$/.test(lastWord)) {
                // 5+5 format (like 12345-67890)
                zip = lastWord;
                addressWords.splice(-1);
                console.log(`Row ${rowIndex}: Found 5+5 zip: "${zip}"`);
                zipFound = true;
              }
            } else if (lastWord.length === 5 && /^\d{5}$/.test(lastWord)) {
              // Standard 5-digit zip
              zip = lastWord;
              addressWords.splice(-1);
              console.log(`Row ${rowIndex}: Found 5-digit zip: "${zip}"`);
              zipFound = true;
            }
          }

          if (zip) {
            row[zipColIndex] = zip;
            console.log(`Row ${rowIndex}: Zip set to: "${zip}"`);
          } else {
            issues.push("zip not found");
          }

          // Parse State (check last 2, 1 words)
          let state = "";
          let stateFound = false;
          for (let wordCount = 2; wordCount >= 1; wordCount--) {
            if (addressWords.length < wordCount) continue;

            const lastWords = addressWords.slice(-wordCount).join(" ");
            console.log(
              `Row ${rowIndex}: Checking for state with ${wordCount} words: "${lastWords}"`
            );

            // Check US states and abbreviations
            const stateMatch = US_STATES.find(
              (s) => s.state === lastWords || s.abbreviation === lastWords
            );

            if (stateMatch) {
              state = stateMatch.abbreviation.toUpperCase();
              console.log(
                `Row ${rowIndex}: Found state: "${state}" (${stateMatch.state})`
              );
              addressWords.splice(-wordCount);
              stateFound = true;
              break;
            }
          }

          if (state) {
            row[stateColIndex] = state;
            console.log(`Row ${rowIndex}: State set to: "${state}"`);
          } else {
            issues.push("state not found");
          }

          // Parse City (check last 3, 2, 1 words)
          let city = "";
          let cityFromDictionary = false;
          for (let wordCount = 3; wordCount >= 1; wordCount--) {
            if (addressWords.length < wordCount) continue;

            const lastWords = addressWords.slice(-wordCount).join(" ");
            console.log(
              `Row ${rowIndex}: Checking for city with ${wordCount} words: "${lastWords}"`
            );

            if (CITIES.includes(lastWords)) {
              city = lastWords;
              console.log(`Row ${rowIndex}: Found city: "${city}"`);
              addressWords.splice(-wordCount);
              cityFromDictionary = true;
              break;
            }
          }

          // If no city found, use last remaining word
          if (!city && addressWords.length > 0) {
            city = addressWords[addressWords.length - 1];
            addressWords.splice(-1);
            console.log(`Row ${rowIndex}: Using last word as city: "${city}"`);
            issues.push("city not in dictionary, fallback used");
          }

          if (city) {
            row[cityColIndex] = city;
            console.log(`Row ${rowIndex}: City set to: "${city}"`);
          } else {
            issues.push("city not found");
          }

          // Update address column with remaining street address
          const streetAddress = addressWords.join(" ");
          row[addressColIndex] = streetAddress;
          console.log(
            `Row ${rowIndex}: Street address set to: "${streetAddress}"`
          );
          console.log(
            `Row ${rowIndex}: Final address words remaining:`,
            addressWords
          );

          if (issues.length > 0) {
            console.log(`Row ${rowIndex}: Issues -> ${issues.join("; ")}`);
          } else {
            console.log(`Row ${rowIndex}: Parsed with no issues.`);
          }

          newData[rowIndex] = row;
        } catch (err) {
          console.error(`Error parsing row ${rowIndex}:`, err);
          errors.push(rowIndex);
        }
      }

      setData(newData);
      setParsingErrors(errors);
      setAddressesParsed(true);
    } catch (err) {
      console.error("Error during address parsing:", err);
      alert("An error occurred during address parsing");
    } finally {
      setIsParsing(false);
    }
  };

  const validateData = async () => {
    setIsValidating(true);

    try {
      const nameColIndex = findColumnIndex("Name");
      const stateColIndex = findColumnIndex("State");
      const countryColIndex = findColumnIndex("Country");

      const longNames: number[] = [];
      const invalidStates: number[] = [];
      const invalidForeignStates: number[] = [];

      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];

        // Check Name column for cells over 70 characters
        if (
          nameColIndex !== -1 &&
          row[nameColIndex] &&
          row[nameColIndex].length > 70
        ) {
          longNames.push(rowIndex);
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

      setValidationErrors({ longNames, invalidStates, invalidForeignStates });
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
        return "bg-yellow-100";
      }
    }

    if (validationErrors.invalidStates.includes(globalRowIndex)) {
      const stateColIndex = findColumnIndex("State");
      if (colIndex === stateColIndex) {
        return "bg-orange-100";
      }
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
            <button
              onClick={parseAddresses}
              disabled={isParsing || addressesParsed}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isParsing || addressesParsed
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {isParsing ? "Parsing..." : "Parse Addresses"}
            </button>

            {addressesParsed && (
              <button
                onClick={validateData}
                disabled={isValidating}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isValidating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {isValidating ? "Validating..." : "Validate Data"}
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
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getCellStyle(
                            rowIndex,
                            colIndex
                          )}`}
                        >
                          {cell}
                        </td>
                      ))}
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
