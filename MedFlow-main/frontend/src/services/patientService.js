import { apiClient } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";

export const patientService = {
  getAll() {
    return apiClient.get(ENDPOINTS.patients.list);
  },

  getById(id) {
    return apiClient.get(ENDPOINTS.patients.detail(id));
  },
};
