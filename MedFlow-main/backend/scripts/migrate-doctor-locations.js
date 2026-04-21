// Migration script to add location data to existing doctors
// Usage: Run this in Node.js or modify as needed for your backend

const doctorLocationData = [
    {
        email: "aisha.khan@medflow.local",
        locationDetails: {
            city: "Mumbai",
            area: "Bandra",
            lat: 19.0596,
            lng: 72.8295,
        },
        clinicType: "private",
    },
    {
        email: "rohan.mehta@medflow.local",
        locationDetails: {
            city: "Delhi",
            area: "South Delhi",
            lat: 28.5244,
            lng: 77.1855,
        },
        clinicType: "government",
    },
    {
        email: "neha.iyer@medflow.local",
        locationDetails: {
            city: "Bangalore",
            area: "Whitefield",
            lat: 12.9698,
            lng: 77.7499,
        },
        clinicType: "private",
    },
    {
        email: "vikram.sethi@medflow.local",
        locationDetails: {
            city: "Hyderabad",
            area: "Jubilee Hills",
            lat: 17.3850,
            lng: 78.4867,
        },
        clinicType: "government",
    },
];

// For MongoDB direct update:
// db.doctors.bulk operations
async function migrateLocationsViaMongoDB(db) {
    const Doctor = db.collection("doctors");

    for (const docData of doctorLocationData) {
        await Doctor.updateOne(
            { email: docData.email },
            {
                $set: {
                    "locationDetails.city": docData.locationDetails.city,
                    "locationDetails.area": docData.locationDetails.area,
                    "locationDetails.lat": docData.locationDetails.lat,
                    "locationDetails.lng": docData.locationDetails.lng,
                    clinicType: docData.clinicType,
                },
            }
        );
    }
}

// For API-based update (if you want an update endpoint):
async function migrateLocationsViaAPI(baseURL, authToken) {
    const API_URL = baseURL || "https://medflow-auwg.onrender.com/api/v1";

    for (const docData of doctorLocationData) {
        try {
            const response = await fetch(`${API_URL}/doctors/update-location`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(docData),
            });

            const result = await response.json();
            if (result.success) {
                console.log(`✓ Updated ${docData.email}`);
            } else {
                console.error(`✗ Failed to update ${docData.email}:`, result.message);
            }
        } catch (error) {
            console.error(`✗ Error updating ${docData.email}:`, error.message);
        }
    }
}

// For bulk CSV import:
function generateCSV() {
    let csv =
        "email,city,area,latitude,longitude,clinicType\n";

    for (const docData of doctorLocationData) {
        csv += `${docData.email},${docData.locationDetails.city},${docData.locationDetails.area},${docData.locationDetails.lat},${docData.locationDetails.lng},${docData.clinicType}\n`;
    }

    return csv;
}

// Backend API endpoint to update doctor location (add to doctorController.js)
/*
export async function updateDoctorLocation(req, res) {
  try {
    const { email, locationDetails, clinicType } = req.body;

    if (!email || !locationDetails || !locationDetails.city) {
      return res.status(400).json({
        success: false,
        message: "Email and location details (city) are required",
      });
    }

    const updated = await Doctor.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          "locationDetails.city": locationDetails.city,
          "locationDetails.area": locationDetails.area || "",
          "locationDetails.lat": locationDetails.lat || null,
          "locationDetails.lng": locationDetails.lng || null,
          clinicType: clinicType || "private",
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor location updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating doctor location:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
*/

// Export for use
export {
    doctorLocationData,
    migrateLocationsViaMongoDB,
    migrateLocationsViaAPI,
    generateCSV,
};

// Example usage:
// import { migrateLocationsViaAPI } from './migration.js';
// migrateLocationsViaAPI('https://medflow-auwg.onrender.com/api/v1', 'your-admin-token');
