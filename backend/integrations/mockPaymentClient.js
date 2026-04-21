/**
 * Mock Payment System
 * Simulates a real payment system for demo and testing purposes
 * No external dependencies or API keys required
 */

export const mockPaymentClient = {
    /**
     * Create a mock payment order
     * @param {number} amount - Amount in rupees
     * @returns {object} Mock order object
     */
    createOrder: (amount) => {
        return {
            id: "order_mock_" + Date.now(),
            amount: Math.round(amount * 100),
            currency: "INR",
            status: "created",
            method: "mock",
            createdAt: new Date().toISOString(),
        };
    },

    /**
     * Verify a mock payment
     * @param {string} orderId - Order ID to verify
     * @returns {object} Verification result
     */
    verifyPayment: (orderId) => {
        if (!orderId || !orderId.startsWith("order_mock_")) {
            return {
                success: false,
                message: "Invalid order ID",
            };
        }

        return {
            success: true,
            orderId,
            message: "Payment verified successfully",
            verifiedAt: new Date().toISOString(),
        };
    },

    /**
     * Simulate payment processing with delay
     * @param {number} delayMs - Delay in milliseconds
     * @returns {promise}
     */
    processPaymentDelay: (delayMs = 1000) => {
        return new Promise((resolve) => setTimeout(resolve, delayMs));
    },
};

export default mockPaymentClient;
