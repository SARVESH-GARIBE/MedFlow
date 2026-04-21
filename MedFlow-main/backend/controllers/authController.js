import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  try {
    console.log("================================");
    console.log("Register request received");
    console.log("Body:", req.body);
    console.log("================================");

    // Ensure JWT_SECRET is present before doing anything to prevent dangling user creation
    if (!process.env.JWT_SECRET) {
      console.error("❌ CRITICAL SETUP ERROR: JWT_SECRET environment variable is missing.");
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact the administrator.'
      });
    }

    const { name, email, password, role = 'patient', phone, city, area } = req.body;

    // === VALIDATION LAYER ===
    // Check all required fields exist
    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields (name, email, password)',
        errors: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be patient or doctor'
      });
    }

    const normalizedEmail = email.toLowerCase();
    console.log("✅ Validation passed for:", { name, email: normalizedEmail, role });

    // === DATABASE CHECKS ===
    console.log("🔍 Checking if email already exists...");
    const userExists = await User.findOne({ email: normalizedEmail }).lean();
    if (userExists) {
      console.log("❌ Email already registered");
      return res.status(409).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // === PASSWORD HASHING ===
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("✅ Password hashed successfully");

    // === CREATE USER ===
    console.log("💾 Creating user in database...");
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone: phone || '',
      assignedArea: {
        city: city || '',
        area: area || ''
      }
    };

    // Add doctor-specific fields if registering as doctor
    if (role === 'doctor') {
      userData.status = 'pending'; // Doctors need verification
      userData.verification = {
        documentType: null,
        documentIdMasked: '',
        isVerified: false
      };
    } else {
      // Patients are auto-verified
      userData.status = 'verified';
      userData.verification = {
        isVerified: true
      };
    }

    const user = await User.create(userData);

    if (!user || !user._id) {
      console.error("❌ User creation failed - no ID returned");
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    console.log("✅ User created successfully:", user._id);

    // === GENERATE TOKEN ===
    console.log("🔑 Generating authentication token...");
    const token = generateToken(user._id, user.role);
    console.log("✅ Token generated successfully");

    // === SUCCESS RESPONSE ===
    console.log("🎉 Registration completed successfully");
    res.status(201).json({
      success: true,
      message: role === 'doctor' ? 'Doctor account created successfully. Please wait for verification.' : 'Patient account created successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          assignedArea: user.assignedArea,
          isVerified: user.verification.isVerified,
          status: user.status
        },
        token
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);

    // Mongoose Validation Error Validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: messages.join(', ')
      });
    }

    // Mongoose Duplicate Key Error (Fallback)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, specialization, experience, location, about } = req.body;

    // Update allowed fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    // Doctor-specific fields
    if (user.role === 'doctor') {
      if (specialization) user.specialization = specialization;
      if (experience) user.experience = experience;
      if (location) user.location = location;
      if (about) user.about = about;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  try {
    console.log("================================");
    console.log("Login request received");
    console.log("Email:", req.body.email);
    console.log("================================");

    // Ensure JWT_SECRET is present before attempting login
    if (!process.env.JWT_SECRET) {
      console.error("❌ CRITICAL SETUP ERROR: JWT_SECRET environment variable is missing.");
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact the administrator.'
      });
    }

    const { email, password } = req.body;

    // === VALIDATION ===
    if (!email || !password) {
      console.log("❌ Validation failed: Missing email or password");
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.toLowerCase();
    console.log("✅ Validation passed for email:", normalizedEmail);

    // === FIND USER ===
    console.log("🔍 Finding user...");
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log("❌ User not found for email:", normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // === VERIFY PASSWORD ===
    console.log("🔐 Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password verification failed");
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log("✅ Password verified successfully");

    // === GENERATE TOKEN ===
    console.log("🔑 Generating authentication token...");
    const token = generateToken(user._id, user.role);
    console.log("✅ Token generated successfully");

    // === SUCCESS RESPONSE ===
    console.log("🎉 Login successful for:", user._id);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("================================");
    console.error("❌ LOGIN ERROR");
    console.error("Error Type:", error.name);
    console.error("Error Message:", error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error("Stack Trace:", error.stack);
    }
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        assignedArea: user.assignedArea,
        verification: user.verification,
        // Doctor-specific fields
        ...(user.role === 'doctor' && {
          specialization: user.specialization,
          experience: user.experience,
          location: user.location,
          about: user.about,
          fee: user.fee,
          rating: user.rating,
          reviewCount: user.reviewCount,
        }),
        // Patient-specific fields
        ...(user.role === 'patient' && {
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
        }),
      }
    });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
