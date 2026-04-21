import { apiClient } from "../api/client.js";

export const prescriptionService = {
    // Create a new prescription
    create(payload) {
        return apiClient.post("/prescriptions", payload);
    },

    // Get prescription by appointment ID
    getByAppointmentId(appointmentId) {
        return apiClient.get(`/prescriptions/appointment/${appointmentId}`);
    },

    // Get all prescriptions for doctor
    getDoctorPrescriptions() {
        return apiClient.get("/prescriptions/doctor/list");
    },

    // Get all prescriptions for patient
    getPatientPrescriptions() {
        return apiClient.get("/prescriptions/patient/list");
    },

    // Update prescription
    update(prescriptionId, payload) {
        return apiClient.patch(`/prescriptions/${prescriptionId}`, payload);
    },

    // Delete prescription
    delete(prescriptionId) {
        return apiClient.delete(`/prescriptions/${prescriptionId}`);
    },
};
