import { fetchWithAuth } from "./api";

/**
 * Request doctor recommendation based on patient symptoms
 * @param {string} symptoms - Patient's symptoms description
 * @returns {Promise} Object with recommendedSpecialization and priority
 */
export const getAIRecommendation = async (symptoms) => {
    try {
        if (!symptoms || symptoms.trim().length < 2) {
            return {
                success: true,
                recommendedSpecialization: null,
                priority: "LOW",
            };
        }

        const response = await fetchWithAuth("/ai/recommend", {
            method: "POST",
            body: JSON.stringify({ symptoms }),
        });

        return {
            success: response.success,
            recommendedSpecialization:
                response.recommendedSpecialization || null,
            priority: response.priority || "LOW",
            error: response.message || null,
        };
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return {
            success: false,
            recommendedSpecialization: null,
            priority: "LOW",
            error: "Failed to get AI recommendation",
        };
    }
};

/**
 * Map priority level to urgency value
 * @param {string} priority - Priority from AI (HIGH, MEDIUM, LOW)
 * @returns {string} Urgency value for appointment form
 */
export const priorityToUrgency = (priority) => {
    switch (priority) {
        case "HIGH":
            return "Emergency";
        case "MEDIUM":
            return "Urgent";
        case "LOW":
        default:
            return "Routine";
    }
};

/**
 * Get priority badge color and icon
 * @param {string} priority - Priority level
 * @returns {{color: string, icon: string, bgColor: string, borderColor: string}}
 */
export const getPriorityStyles = (priority) => {
    const styles = {
        HIGH: {
            color: "text-rose-400",
            bgColor: "bg-rose-500/20",
            borderColor: "border-rose-400/50",
            icon: "🚨",
            label: "CRITICAL",
        },
        MEDIUM: {
            color: "text-amber-400",
            bgColor: "bg-amber-500/20",
            borderColor: "border-amber-400/50",
            icon: "⚠️",
            label: "URGENT",
        },
        LOW: {
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/20",
            borderColor: "border-emerald-400/50",
            icon: "✓",
            label: "ROUTINE",
        },
    };

    return styles[priority] || styles.LOW;
};

/**
 * Validate and normalize recommendation data
 * @param {Object} recommendation - AI recommendation object
 * @returns {Object} Normalized recommendation
 */
export const normalizeRecommendation = (recommendation) => {
    return {
        specialization: recommendation?.recommendedSpecialization || null,
        priority: recommendation?.priority || "LOW",
        urgency: priorityToUrgency(recommendation?.priority),
        isValid:
            recommendation?.success &&
            recommendation?.recommendedSpecialization !== null,
    };
};
