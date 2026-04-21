import { fetchWithAuth } from "./api";

/**
 * Search for nearby doctors based on location and filters
 * @param {Object} filters - Search filters
 * @param {string} filters.city - Required: City name
 * @param {string} filters.area - Optional: Area/neighborhood
 * @param {string} filters.specialization - Optional: Doctor specialization
 * @param {string} filters.clinicType - Optional: 'government' or 'private'
 * @param {string} filters.availability - Optional: 'Available' or 'Unavailable'
 * @param {string} filters.sortBy - Optional: 'rating', 'availability', 'fee', 'experience'
 * @returns {Promise} Object with doctors array and metadata
 */
export const searchNearbyDoctors = async (filters) => {
    try {
        if (!filters.city) {
            return {
                success: false,
                data: [],
                count: 0,
                message: "City is required",
            };
        }

        const params = new URLSearchParams();
        params.append("city", filters.city);

        if (filters.area) params.append("area", filters.area);
        if (filters.specialization) params.append("specialization", filters.specialization);
        if (filters.clinicType) params.append("clinicType", filters.clinicType);
        if (filters.availability) params.append("availability", filters.availability);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);

        const response = await fetchWithAuth(
            `/doctors/nearby?${params.toString()}`
        );

        return {
            success: response.success,
            data: response.data || [],
            count: response.count || 0,
            message: response.message,
        };
    } catch (error) {
        console.error("Doctor Search Error:", error);
        return {
            success: false,
            data: [],
            count: 0,
            message: "Failed to search doctors",
        };
    }
};

/**
 * Get doctor badge information
 * @param {string} clinicType - 'government' or 'private'
 * @returns {{icon: string, label: string, color: string}}
 */
export const getClinicBadge = (clinicType) => {
    if (clinicType === "government") {
        return {
            icon: "🏥",
            label: "Government",
            color: "text-blue-400",
        };
    }
    return {
        icon: "🏢",
        label: "Private",
        color: "text-purple-400",
    };
};

/**
 * Format doctor location information
 * @param {Object} locationDetails - Doctor's location details
 * @returns {string} Formatted location string
 */
export const formatDoctorLocation = (locationDetails) => {
    if (!locationDetails) return "Location not specified";

    const parts = [];
    if (locationDetails.area) parts.push(locationDetails.area);
    if (locationDetails.city) parts.push(locationDetails.city);

    return parts.length > 0 ? parts.join(", ") : "Location not specified";
};

/**
 * Sort doctors array
 * @param {Array} doctors - Array of doctor objects
 * @param {string} sortBy - Sort criterion: 'rating', 'fee', 'availability', 'experience'
 * @returns {Array} Sorted doctors array
 */
export const sortDoctors = (doctors, sortBy = "rating") => {
    const sorted = [...doctors];

    switch (sortBy) {
        case "fee":
            return sorted.sort((a, b) => (a.fee || 0) - (b.fee || 0));
        case "experience":
            return sorted.sort((a, b) => {
                const aExp = parseInt(a.experience) || 0;
                const bExp = parseInt(b.experience) || 0;
                return bExp - aExp;
            });
        case "availability":
            return sorted.sort((a, b) => {
                // Available doctors first
                if (a.availability !== b.availability) {
                    return a.availability === "Available" ? -1 : 1;
                }
                // Then by rating
                return (b.rating || 0) - (a.rating || 0);
            });
        case "rating":
        default:
            return sorted.sort((a, b) => {
                const aDiff = (b.rating || 0) - (a.rating || 0);
                if (aDiff !== 0) return aDiff;
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            });
    }
};

/**
 * Filter doctors by specialization
 * @param {Array} doctors - Array of doctor objects
 * @param {string} specialization - Specialization to filter by
 * @returns {Array} Filtered doctors array
 */
export const filterBySpecialization = (doctors, specialization) => {
    if (!specialization) return doctors;

    return doctors.filter((doc) =>
        doc.specialization
            ?.toLowerCase()
            .includes(specialization.toLowerCase())
    );
};

/**
 * Get available nearby areas for a city
 * @param {string} city - City name
 * @returns {Array} Array of areas in the city
 */
export const getAreasByCity = (city) => {
    const AREAS_BY_CITY = {
        Mumbai: [
            "Bandra",
            "Worli",
            "Andheri",
            "Dadar",
            "Fort",
            "Vile Parle",
            "Borivali",
        ],
        Delhi: ["South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central"],
        Bangalore: [
            "Whitefield",
            "Indiranagar",
            "Koramangala",
            "HSR Layout",
            "Marathon",
            "Ulsoor",
        ],
        Hyderabad: [
            "Jubilee Hills",
            "Banjara Hills",
            "Kachiguda",
            "Secunderabad",
            "Somajiguda",
        ],
        Chennai: ["Anna Nagar", "Chetpet", "T Nagar", "Velachery", "Guindy"],
        Kolkata: ["Park Circus", "Alipore", "Bidhannagar", "Bhowanipur", "Kalikapur"],
        Pune: ["Koregaon Park", "Kothrud", "Hinjewadi", "Viman Nagar", "Yerwada"],
        Ahmedabad: [
            "Ahmedabad East",
            "Ahmedabad West",
            "South Ahmedabad",
            "Old City",
        ],
        Jaipur: [
            "C-Scheme",
            "S.I.T",
            "Malviya Nagar",
            "Vaishali Nagar",
            "Banasthali",
        ],
        Lucknow: [
            "Gomti Nagar",
            "Indira Nagar",
            "Alambagh",
            "Hazratganj",
            "Lucknowganj",
        ],
        Chandigarh: [
            "Sector 17",
            "Sector 22",
            "Sector 35",
            "Sector 43",
            "Panchkula",
        ],
        Indore: ["Rajwada", "Khajrana", "Rau", "Vijay Nagar", "Pologround"],
    };

    return AREAS_BY_CITY[city] || [];
};
