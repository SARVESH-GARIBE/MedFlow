// Base API URL - Must be set via environment variable
// For local development, create .env.local with VITE_API_BASE_URL=http://localhost:5000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("⚠️ VITE_API_BASE_URL is not configured. API calls will fail.");
  console.warn("For local development, create a .env.local file with:");
  console.warn("VITE_API_BASE_URL=http://localhost:5000/api/v1");
} else {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

// Export once only
export { API_BASE_URL };

// Helper to build full URL
function buildUrl(path) {
  const normalizedPath = String(path || "").startsWith("/")
    ? String(path)
    : `/${String(path || "")}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

// Handle response parsing + errors
async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (payload?.message || payload?.error)) ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
}

// Generic API request
export async function apiRequest(path, options = {}) {
  // Get token from localStorage if it exists
  const token = localStorage.getItem('medflow.token');
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach token if present and not already provided
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: "GET",
    ...options,
    headers, // Make sure we pass our merged headers
  };

  try {
    const response = await fetch(buildUrl(path), config);
    return await parseResponse(response);
  } catch (error) {
    console.error(`API Request failed for ${path}:`, error);

    // Gracefully handle "Failed to fetch" (Network error, CORS, or server down)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      const customError = new Error("Network Error: Unable to connect to the backend server. The server might be down or restarting.");
      customError.status = 0;
      customError.payload = { message: customError.message };
      throw customError;
    }

    throw error;
  }
}

// API client shortcuts
export const apiClient = {
  get: (path, options = {}) =>
    apiRequest(path, { ...options, method: "GET" }),

  post: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: (path, options = {}) =>
    apiRequest(path, { ...options, method: "DELETE" }),
};