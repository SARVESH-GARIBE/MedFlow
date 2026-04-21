import { getData, setData } from "./storage.js";

function getRandomName() {
  const names = [
    "Rohan Mehta",
    "Priya Sharma",
    "Aarav Patel",
    "Sneha Verma",
    "Karan Gupta",
    "Neha Joshi",
    "Aditya Kulkarni",
    "Isha Kapoor",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getSeedPatientName() {
  try {
    const raw = window.localStorage.getItem("medflow.currentUser");
    const parsed = raw ? JSON.parse(raw) : null;
    const name = parsed?.name;
    return typeof name === "string" && name.trim() ? name.trim() : getRandomName();
  } catch {
    return getRandomName();
  }
}

function nowIso() {
  return new Date().toISOString();
}

function seedIfEmpty(key, value) {
  const existing = getData(key, null);
  if (existing === null || existing === undefined) {
    setData(key, value);
  }
}

export function ensureMedflowSeed() {
  const seededPatientName = getSeedPatientName();

  // Doctors
  seedIfEmpty("medflow.doctors", [
    {
      _id: "doc_001",
      name: "Dr. Aisha Khan",
      email: "aisha.khan@medflow.local",
      specialization: "Cardiology",
      fee: 800,
      availability: "Available",
      approvalStatus: "approved",
      rejectionReason: "",
      isActive: true,
      clinicType: "private",
      locationDetails: {
        city: "Mumbai",
        area: "Bandra",
        lat: 19.0596,
        lng: 72.8295,
      },
      createdAt: "2026-03-01T09:00:00.000Z",
    },
    {
      _id: "doc_002",
      name: "Dr. Rohan Mehta",
      email: "rohan.mehta@medflow.local",
      specialization: "Orthopedics",
      fee: 700,
      availability: "Unavailable",
      status: "pending",
      aadhaarNumber: "123412341235",
      panNumber: "ABCDE1235F",
      medicalRegistrationNumber: "MCI12346",
      schedule: {},
      rejectionReason: "",
      isActive: true,
      clinicType: "government",
      locationDetails: {
        city: "Delhi",
        area: "South Delhi",
        lat: 28.5244,
        lng: 77.1855,
      },
      createdAt: "2026-03-18T12:20:00.000Z",
    },
    {
      _id: "doc_003",
      name: "Dr. Neha Iyer",
      email: "neha.iyer@medflow.local",
      specialization: "Dermatology",
      fee: 600,
      availability: "Available",
      approvalStatus: "approved",
      rejectionReason: "",
      isActive: true,
      clinicType: "private",
      locationDetails: {
        city: "Bangalore",
        area: "Whitefield",
        lat: 12.9698,
        lng: 77.7499,
      },
      createdAt: "2026-02-22T15:10:00.000Z",
    },
    {
      _id: "doc_004",
      name: "Dr. Vikram Sethi",
      email: "vikram.sethi@medflow.local",
      specialization: "General Medicine",
      fee: 500,
      availability: "Available",
      status: "rejected",
      aadhaarNumber: "123412341237",
      panNumber: "ABCDE1237F",
      medicalRegistrationNumber: "MCI12348",
      schedule: {},
      rejectionReason: "Incomplete verification documents",
      isActive: true,
      clinicType: "government",
      locationDetails: {
        city: "Hyderabad",
        area: "Jubilee Hills",
        lat: 17.3850,
        lng: 78.4867,
      },
      createdAt: "2026-03-10T10:45:00.000Z",
    },
  ]);

  // Patients
  seedIfEmpty("medflow.patients", [
    {
      _id: "pat_001",
      name: seededPatientName,
      email: "ananya.sharma@medflow.local",
      phone: "9876543210",
      isActive: true,
      createdAt: "2026-02-10T08:30:00.000Z",
    },
    {
      _id: "pat_002",
      name: "Ravi Patel",
      email: "ravi.patel@medflow.local",
      phone: "9123456780",
      isActive: true,
      createdAt: "2026-03-05T11:05:00.000Z",
    },
  ]);

  // Departments
  seedIfEmpty("medflow.departments", [
    { _id: "dep_001", name: "Cardiology", description: "Heart & vascular care", isActive: true, createdAt: "2026-01-15T09:00:00.000Z" },
    { _id: "dep_002", name: "Orthopedics", description: "Bones, joints & rehab", isActive: true, createdAt: "2026-01-15T09:00:00.000Z" },
    { _id: "dep_003", name: "Dermatology", description: "Skin, hair & nails", isActive: true, createdAt: "2026-01-15T09:00:00.000Z" },
    { _id: "dep_004", name: "General Medicine", description: "Primary & internal medicine", isActive: true, createdAt: "2026-01-15T09:00:00.000Z" },
  ]);

  // Appointments (denormalized snapshots for admin tables)
  seedIfEmpty("medflow.appointments", [
    {
      _id: "apt_1001",
      doctor: { _id: "doc_001", name: "Dr. Aisha Khan", specialization: "Cardiology" },
      patient: { _id: "pat_001", name: seededPatientName, email: "ananya.sharma@medflow.local" },
      department: "Cardiology",
      appointmentDate: "2026-03-29T10:30:00.000Z",
      timeSlot: "10:30 AM",
      status: "confirmed",
      paymentStatus: "paid",
      paidAt: 1761725400000,
      createdAt: "2026-03-26T09:00:00.000Z",
    },
    {
      _id: "apt_1002",
      doctor: { _id: "doc_004", name: "Dr. Vikram Sethi", specialization: "General Medicine" },
      patient: { _id: "pat_001", name: seededPatientName, email: "ananya.sharma@medflow.local" },
      department: "General Medicine",
      appointmentDate: "2026-04-02T16:00:00.000Z",
      timeSlot: "04:00 PM",
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2026-03-26T09:10:00.000Z",
    },
  ]);

  // Payments history (derived; used for admin analytics)
  seedIfEmpty("medflow.payments", [
    {
      _id: "pay_9001",
      appointmentId: "apt_1001",
      doctorId: "doc_001",
      doctorName: "Dr. Aisha Khan",
      patientId: "pat_001",
      patientName: seededPatientName,
      amount: 800,
      currency: "INR",
      status: "paid",
      method: "Card",
      createdAt: nowIso(),
    },
  ]);

  // Doctor slots map by doctor/date
  // shape: { [doctorId]: { [yyyy-mm-dd]: ["09:00 AM", ...] } }
  seedIfEmpty("medflow.slots", {
    doc_001: {
      "2026-03-29": ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "04:00 PM"],
      "2026-03-30": ["09:00 AM", "10:00 AM", "10:30 AM", "04:30 PM"],
    },
    doc_002: {
      "2026-03-29": ["09:30 AM", "10:30 AM", "11:00 AM", "05:00 PM"],
    },
    doc_003: {
      "2026-03-29": ["09:00 AM", "10:00 AM", "04:00 PM", "04:30 PM"],
    },
  });
}

