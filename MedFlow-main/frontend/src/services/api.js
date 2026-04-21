import { API_BASE_URL } from "../api/client.js";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("medflow.token") || "";

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch data");
  }

  return data;
};
