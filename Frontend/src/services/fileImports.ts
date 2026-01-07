/**
 * File import API service
 */
import apiRequest from "./api";

export interface FileImportCreate {
  project_id: string;
  import_type: string;
  filename: string;
  data: {
    names?: string[];
    part_numbers?: string[];
    vendor_names?: string[];
  };
}

export interface ImportDataResponse {
  data_type: string;
  values: string[];
}

/**
 * Create a file import record
 * @param data - File import data
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function createFileImport(
  data: FileImportCreate,
  token: string | null
): Promise<void> {
  return apiRequest<void>("/api/file-imports", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get import data for cross-validation
 * @param projectId - Project ID
 * @param importType - Import type to get data for (e.g., "vendor" to get vendor names when validating customer)
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function getImportData(
  projectId: string,
  importType: string,
  token: string | null
): Promise<ImportDataResponse[]> {
  return apiRequest<ImportDataResponse[]>(
    `/api/file-imports/${projectId}/${importType}`,
    token
  );
}

