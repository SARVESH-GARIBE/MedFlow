import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendDoctorVerificationEmail, IS_DEMO_MODE } from "../services/emailService.js";
import bcrypt from "bcrypt";

//Helper Functions 
// this function will convert time to number of minutes from the start of the day, which will help in sorting the schedule slots
const parseTimeToMinutes = (t = "") => {
  const [time = "0:00", ampm = ""] = (t || "").split(" ");
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  let h = hh % 12;
  if ((ampm || "").toUpperCase() === "PM") h += 12;
  return h * 60 + (mm || 0);
};


//this fucntion will remove duplicate slots and sort the schedule slots in ascending order for each date
function dedupeAndSortSchedule(schedule = {}) {
  const out = {};
  Object.entries(schedule).forEach(([date, slots]) => {
    if (!Array.isArray(slots)) return;
    const uniq = Array.from(new Set(slots));
    uniq.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    out[date] = uniq;
  });
  return out;
}

//this function will parse the schedule input from the client, which can be either a JSON string or an object, and then it will remove duplicate slots and sort the schedule slots in ascending order for each date
function parseScheduleInput(s) {
  if (!s) return {};
  if (typeof s === "string") {
    try {
      s = JSON.parse(s);
    } catch {
      return {};
    }
  }
  return dedupeAndSortSchedule(s || {});
}


//this function will normalize the doctor document before sending it to the client, it will convert the Mongoose Map to a plain object and also set default values for some fields if they are not present in the document
function normalizeDocForClient(raw = {}) {
  const doc = { ...raw };

  // convert Mongoose Map to plain object
  if (doc.schedule && typeof doc.schedule.forEach === "function") {
    const obj = {};
    doc.schedule.forEach((val, key) => {
      obj[key] = Array.isArray(val) ? val : [];
    });
    doc.schedule = obj;
  } else if (!doc.schedule || typeof doc.schedule !== "object") {
    doc.schedule = {};
  }

  doc.availability = doc.availability === undefined ? "Available" : doc.availability;
  doc.patients = doc.patients ?? "";
  doc.rating = doc.rating ?? 0;
  doc.fee = doc.fee ?? doc.fees ?? 0;

  return doc;
}

//to create a new doctor profile, it will upload the profile image to cloudinary and then save the doctor document in the database
export async function createDoctorProfile(req, res) {
  try {//
    const body = req.body || {};
    if (!body.email || !body.password || !body.name) {
      return res.status(400).json({ message: "Email, password and name are required" });
    }//check if doctor with the same email already exists
    const emailLC = (body.email || "").toLowerCase();
    if (await Doctor.findOne({ email: emailLC })) {
      return res.status(400).json({ message: "Doctor with this email already exists" });
    }
    //upload profile image to cloudinary if it is present in the request
    let imageUrl = body.imageUrl || null;
    let imagePublicId = body.imagePublicId || null;
    //if the request contains a file, it means the client is uploading a new image, so we need to upload it to cloudinary and get the new image URL and public ID, if the request does not contain a file but contains imageUrl and imagePublicId, it means the client is keeping the existing image, so we can use the existing image URL and public ID, if the request does not contain a file and does not contain imageUrl and imagePublicId, it means the client is removing the existing image, so we can set the image URL and public ID to null
    if (req.file?.path) {
      const result = await uploadToCloudinary(req.file.path, "doctor-profiles");
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    //create a new doctor document and save it in the database
    const doctor = new Doctor({
      ...body,
      email: emailLC,
      imageUrl,
      imagePublicId
    });
    //save the doctor document in the database and return the normalized doctor document to the client
    const savedDoctor = await doctor.save();
    return res.status(201).json(normalizeDocForClient(savedDoctor));
  } catch (error) {
    console.error("Error creating doctor profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//to get list of doctors (only verified ones)
export async function getDoctors(req, res) {
  try {
    const doctors = await Doctor.find({ status: "verified" }).select("-password");

    const normalized = doctors.map((doc) =>
      normalizeDocForClient(doc.toObject ? doc.toObject() : doc)
    );

    return res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//to update doctor availability by id
export async function updateDoctorAvailability(req, res) {
  try {
    const { id } = req.params;
    const { availability } = req.body || {};

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Availability is required",
      });
    }

    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.availability = availability;
    const updatedDoctor = await doctor.save();

    return res.status(200).json({
      success: true,
      data: normalizeDocForClient(
        updatedDoctor.toObject ? updatedDoctor.toObject() : updatedDoctor
      ),
    });
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//to update doctor schedule by id
export async function updateDoctorSchedule(req, res) {
  try {
    const { id } = req.params;
    const { schedule } = req.body || {};

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Schedule is required",
      });
    }

    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const parsedSchedule = parseScheduleInput(schedule);
    doctor.schedule = parsedSchedule;

    const updatedDoctor = await doctor.save();

    return res.status(200).json({
      success: true,
      data: normalizeDocForClient(
        updatedDoctor.toObject ? updatedDoctor.toObject() : updatedDoctor
      ),
    });
  } catch (error) {
    console.error("Error updating doctor schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get single doctor profile based on JWT token
export async function getDoctorProfile(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. ID missing from token.",
      });
    }

    const doctor = await Doctor.findById(req.user.id).select("-password -__v");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: normalizeDocForClient(
        doctor.toObject ? doctor.toObject() : doctor
      ),
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching doctor profile",
    });
  }
}

// Get nearby doctors by city and area
export async function getNearbyDoctors(req, res) {
  try {
    const { city, area, sortBy, specialization, clinicType, availability } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    // Build filter query
    const filter = {
      status: "verified",
      isActive: true,
      "locationDetails.city": { $regex: city, $options: "i" },
    };

    // Add area filter if provided
    if (area) {
      filter["locationDetails.area"] = { $regex: area, $options: "i" };
    }

    // Add specialization filter if provided
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    // Add clinic type filter if provided
    if (clinicType && ["government", "private"].includes(clinicType)) {
      filter.clinicType = clinicType;
    }

    // Add availability filter if provided
    if (availability && ["Available", "Unavailable"].includes(availability)) {
      filter.availability = availability;
    }

    // Fetch doctors with filters
    let query = Doctor.find(filter).select("-password -__v");

    // Apply sorting
    if (sortBy === "rating") {
      query = query.sort({ rating: -1, reviewCount: -1 });
    } else if (sortBy === "availability") {
      // Sort available doctors first
      query = query.sort({
        availability: -1,
        rating: -1,
        reviewCount: -1
      });
    } else if (sortBy === "fee") {
      query = query.sort({ fee: 1, rating: -1 });
    } else if (sortBy === "experience") {
      query = query.sort({ experience: -1, rating: -1 });
    } else {
      // Default: by rating first, then by review count
      query = query.sort({ rating: -1, reviewCount: -1 });
    }

    const doctors = await query.limit(50);

    // Normalize doctor data
    const normalizedDoctors = doctors.map((doc) =>
      normalizeDocForClient(doc.toObject ? doc.toObject() : doc)
    );

    return res.status(200).json({
      success: true,
      count: normalizedDoctors.length,
      data: normalizedDoctors,
    });
  } catch (error) {
    console.error("Error fetching nearby doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching nearby doctors",
    });
  }
}

// @desc    Register a new doctor
// @route   POST /api/v1/doctors/register
export async function registerDoctor(req, res) {
  try {
    const { name, email, password, specialization, experience, fee, availability, aadhaarNumber, panNumber, medicalRegistrationNumber } = req.body;

    if (!name || !email || !password || !specialization || fee === undefined || !aadhaarNumber || !panNumber || !medicalRegistrationNumber) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const emailLC = String(email).toLowerCase();

    // Check if user exists as doctor or patient
    const existingDoctor = await Doctor.findOne({ email: emailLC }).lean();
    if (existingDoctor) {
      return res.status(409).json({ success: false, message: "This email is already registered as a doctor" });
    }
    
    const existingPatient = await Patient.findOne({ email: emailLC }).lean();
    if (existingPatient) {
      return res.status(409).json({ success: false, message: "This email is already registered as a patient" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine initial status based on demo mode
    const initialStatus = IS_DEMO_MODE ? "verified" : "pending";

    const doctor = new Doctor({
      name: name.trim(),
      email: emailLC,
      password: hashedPassword,
      specialization,
      experience: experience || '',
      fee: Number(fee),
      availability: availability || 'Available',
      aadhaarNumber,
      panNumber,
      medicalRegistrationNumber,
      status: initialStatus
    });

    const savedDoctor = await doctor.save();

    // Send welcome email
    sendDoctorVerificationEmail(
      savedDoctor.email, 
      savedDoctor.name, 
      IS_DEMO_MODE, 
      IS_DEMO_MODE ? '' : undefined
    ).catch(err => console.error('Failed to send welcome email:', err));

    const responseMessage = IS_DEMO_MODE 
      ? "Doctor registered and verified successfully! You can now access the doctor panel."
      : "Doctor registered successfully. Your profile is under verification.";

    return res.status(201).json({
      success: true,
      message: responseMessage,
      isDemoMode: IS_DEMO_MODE,
      doctor: {
        id: savedDoctor._id,
        name: savedDoctor.name,
        email: savedDoctor.email,
        status: savedDoctor.status
      }
    });

  } catch (error) {
    console.error("Error registering doctor:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Get single doctor by ID
export async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password -__v");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    return res.status(200).json({
      success: true,
      data: normalizeDocForClient(doctor.toObject ? doctor.toObject() : doctor)
    });
  } catch (error) {
    console.error("Error fetching doctor by id:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}