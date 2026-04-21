import { apiClient } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";

export const appointmentService = {
  getAll() {
    return apiClient.get(ENDPOINTS.appointments.list);
  },

  getById(id) {
    return apiClient.get(ENDPOINTS.appointments.detail(id));
  },

  create(payload) {
    return apiClient.post(ENDPOINTS.appointments.create, payload);
  },

  getByPatientId(patientId) {
    return apiClient.get(`/appointments/patient/${patientId}`);
  },

  getByDoctorId(doctorId) {
    return apiClient.get(`/appointments/doctor/${doctorId}`);
  },

  updateStatus(id, status) {
    return apiClient.patch(ENDPOINTS.appointments.updateStatus(id), { status });
  },

  remove(id) {
    return apiClient.delete(ENDPOINTS.appointments.detail(id));
  },
};
