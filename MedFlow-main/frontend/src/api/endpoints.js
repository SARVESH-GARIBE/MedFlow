export const ENDPOINTS = {
  appointments: {
    list: "/appointments",
    create: "/appointments",
    detail: (id) => `/appointments/${id}`,
    updateStatus: (id) => `/appointments/${id}/status`,
    bookedSlots: (doctorId, date) => `/appointments/booked-slots/${doctorId}/${date}`,
  },
  doctors: {
    list: "/doctors",
    nearby: "/doctors/nearby",
    detail: (id) => `/doctors/${id}`,
    availability: (id) => `/doctors/${id}/availability`,
    schedule: (id) => `/doctors/${id}/schedule`,
    profile: "/doctors/me",
  },
  patients: {
    list: "/patients",
    detail: (id) => `/patients/${id}`,
  },
  payments: {
    list: "/payments",
    createOrder: "/payments/create-order",
    verify: "/payments/verify",
    detail: (id) => `/payments/${id}`,
  },
  prescriptions: {
    create: "/prescriptions",
    getByAppointment: (appointmentId) => `/prescriptions/appointment/${appointmentId}`,
    doctorList: "/prescriptions/doctor/list",
    patientList: "/prescriptions/patient/list",
    update: (prescriptionId) => `/prescriptions/${prescriptionId}`,
    delete: (prescriptionId) => `/prescriptions/${prescriptionId}`,
  },
  ai: {
    recommend: "/ai/recommend",
  },
  reviews: {
    create: "/reviews",
    getByDoctor: (doctorId) => `/reviews/doctor/${doctorId}`,
    list: "/reviews",
  },
};
