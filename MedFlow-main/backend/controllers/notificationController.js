import Notification from "../models/Notification.js";

// Fetch notifications for the logged in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Assuming req.user.role correctly specifies 'patient' or 'doctor'
    const role = req.user.role;

    const notifications = await Notification.find({ userId, role }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
