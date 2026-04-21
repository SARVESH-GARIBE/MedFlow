import { apiClient } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";

export const doctorService = {
  getAll() {
    return apiClient.get(ENDPOINTS.doctors.list);
  },

  getById(id) {
    return apiClient.get(ENDPOINTS.doctors.detail(id));
  },

  updateAvailability(id, payload) {
    return apiClient.patch(ENDPOINTS.doctors.availability(id), payload);
  },

  getNearby(params) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`${ENDPOINTS.doctors.nearby}?${queryString}`);
  },
};
