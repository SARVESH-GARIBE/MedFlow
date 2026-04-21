import { apiClient } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";

export const paymentService = {
  getAll() {
    return apiClient.get(ENDPOINTS.payments.list);
  },

  getById(id) {
    return apiClient.get(ENDPOINTS.payments.detail(id));
  },

  createOrder(payload) {
    return apiClient.post(ENDPOINTS.payments.createOrder, payload);
  },

  verify(payload) {
    return apiClient.post(ENDPOINTS.payments.verify, payload);
  },
};
