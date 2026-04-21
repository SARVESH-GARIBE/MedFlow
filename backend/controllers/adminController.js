import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import generateToken from '../utils/generateToken.js';
import { sendDoctorVerificationEmail, IS_DEMO_MODE } from '../services/emailService.js';

// @desc    Get all users with filtering and pagination
// @route   GET /api/v1/admin/users
// @access  Private (super_admin, admin)
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = {};

    if (req.user.role === 'admin') {
      // Admin can only see users in their assigned area
      filter = {
        $or: [
          { 'assignedArea.city': req.user.assignedArea.city },
          { role: { $in: ['super_admin', 'admin'] } } // Admins can see other admins/super_admin
        ]
      };
    }

    // Add additional filters
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter['assignedArea.city'] = req.query.city;
    if (req.query.isVerified !== undefined) filter['verification.isVerified'] = req.query.isVerified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Get single user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private (super_admin, admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check area access for admin
    if (req.user.role === 'admin' && user.role !== 'super_admin' && user.role !== 'admin') {
      if (user.assignedArea.city !== req.user.assignedArea.city) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Area restriction'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user role and area assignment
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (super_admin only for role changes, admin for area)
export const updateUserRole = async (req, res) => {
  try {
    const { role, assignedArea } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only super_admin can change roles
    if (role && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can change user roles'
      });
    }

    // Validate role
    if (role && !['super_admin', 'admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Update role if provided
    if (role) {
      user.role = role;
    }

    // Update assigned area if provided
    if (assignedArea) {
      user.assignedArea = {
        city: assignedArea.city || user.assignedArea.city,
        area: assignedArea.area || user.assignedArea.area
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User role/area updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify user account
// @route   PUT /api/v1/admin/users/:id/verify
// @access  Private (super_admin, admin)
export const verifyUser = async (req, res) => {
  try {
    const { isVerified, documentType, documentIdMasked } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check area access for admin
    if (req.user.role === 'admin' && user.role !== 'super_admin' && user.role !== 'admin') {
      if (user.assignedArea.city !== req.user.assignedArea.city) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Area restriction'
        });
      }
    }

    // Update verification status
    user.verification = {
      documentType: documentType || user.verification.documentType,
      documentIdMasked: documentIdMasked || user.verification.documentIdMasked,
      isVerified: isVerified !== undefined ? isVerified : user.verification.isVerified
    };

    // Update user status based on verification
    if (isVerified) {
      user.status = 'verified';
      user.rejectionReason = '';
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User verification updated successfully'
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject user account
// @route   PUT /api/v1/admin/users/:id/reject
// @access  Private (super_admin, admin)
export const rejectUser = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check area access for admin
    if (req.user.role === 'admin' && user.role !== 'super_admin' && user.role !== 'admin') {
      if (user.assignedArea.city !== req.user.assignedArea.city) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Area restriction'
        });
      }
    }

    user.status = 'rejected';
    user.rejectionReason = rejectionReason;
    user.verification.isVerified = false;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User account rejected'
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private (super_admin, admin)
export const getDashboardStats = async (req, res) => {
  try {
    let filter = {};

    // Apply area filter for admin users
    if (req.user.role === 'admin') {
      filter = {
        $or: [
          { 'assignedArea.city': req.user.assignedArea.city },
          { role: { $in: ['super_admin', 'admin'] } }
        ]
      };
    }

    const stats = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          patients: { $sum: { $cond: [{ $eq: ['$role', 'patient'] }, 1, 0] } },
          doctors: { $sum: { $cond: [{ $eq: ['$role', 'doctor'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$verification.isVerified', 1, 0] } },
          pendingUsers: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejectedUsers: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      patients: 0,
      doctors: 0,
      admins: 0,
      verifiedUsers: 0,
      pendingUsers: 0,
      rejectedUsers: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create admin user
// @route   POST /api/v1/admin/users
// @access  Private (super_admin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, assignedArea } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !assignedArea?.city) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including assigned area city'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create admin user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      assignedArea,
      verification: {
        isVerified: true // Auto-verify admin accounts
      },
      status: 'verified'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedArea: user.assignedArea,
        token
      },
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all doctors (pending or all)
// @route   GET /api/v1/admin/doctors
// @access  Private (super_admin, admin)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "pending" }); // Only pending doctors requested by user
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve a doctor
// @route   PUT /api/v1/admin/doctors/:id/approve
// @access  Private (super_admin, admin)
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.status = "verified";
    doctor.rejectionReason = "";
    await doctor.save();

    // Send approval email (async - don't wait)
    sendDoctorVerificationEmail(doctor.email, doctor.name, true).catch(err => {
      console.error('Failed to send approval email:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Doctor approved successfully. Verification email sent.',
      data: doctor
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject a doctor
// @route   PUT /api/v1/admin/doctors/:id/reject
// @access  Private (super_admin, admin)
export const rejectDoctor = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.status = "rejected";
    doctor.rejectionReason = rejectionReason;
    await doctor.save();

    // Send rejection email (async - don't wait)
    sendDoctorVerificationEmail(doctor.email, doctor.name, false, rejectionReason).catch(err => {
      console.error('Failed to send rejection email:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Doctor rejected successfully. Notification email sent.',
      data: doctor
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

