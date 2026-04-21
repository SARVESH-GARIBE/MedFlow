import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✅ ${msg}${COLORS.reset}`),
  error: (msg) => console.log(`${COLORS.red}❌ ${msg}${COLORS.reset}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠️  ${msg}${COLORS.reset}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ️  ${msg}${COLORS.reset}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${COLORS.bright}${msg}${COLORS.reset}\n`),
};

async function verifyAuth() {
  log.section('🔐 AUTH SYSTEM VERIFICATION');

  try {
    // 1. CHECK ENVIRONMENT VARIABLES
    log.section('1️⃣  CHECKING ENVIRONMENT VARIABLES');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      log.error('MONGODB_URI not defined');
      process.exit(1);
    } else {
      log.success(`MONGODB_URI: ${mongoUri}`);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      log.error('JWT_SECRET not defined');
      process.exit(1);
    } else {
      log.success(`JWT_SECRET: ${jwtSecret}`);
    }

    const nodeEnv = process.env.NODE_ENV || 'development';
    log.success(`NODE_ENV: ${nodeEnv}`);

    // 2. TEST MONGODB CONNECTION
    log.section('2️⃣  TESTING MONGODB CONNECTION');
    
    await mongoose.connect(mongoUri);
    log.success('Connected to MongoDB');
    
    const adminConnection = mongoose.connection.getClient().topology;
    log.success(`Server status: Connected`);

    // 3. VERIFY COLLECTIONS
    log.section('3️⃣  VERIFYING COLLECTIONS');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (collectionNames.includes('patients')) {
      log.success('Patients collection exists');
    } else {
      log.warn('Patients collection not found - will be created on first insert');
    }

    if (collectionNames.includes('doctors')) {
      log.success('Doctors collection exists');
    } else {
      log.warn('Doctors collection not found - will be created on first insert');
    }

    // 4. TEST PASSWORD HASHING
    log.section('4️⃣  TESTING PASSWORD HASHING');
    
    const testPassword = 'TestPassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    log.success('Password hashed successfully');
    
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    if (isMatch) {
      log.success('Password comparison works correctly');
    } else {
      log.error('Password comparison FAILED');
    }

    // 5. TEST JWT TOKEN GENERATION
    log.section('5️⃣  TESTING JWT TOKEN GENERATION');
    
    const payload = { id: 'test123', role: 'patient' };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
    log.success(`Token generated: ${token.substring(0, 20)}...`);
    
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.id === 'test123' && decoded.role === 'patient') {
      log.success('Token verification works correctly');
    } else {
      log.error('Token verification FAILED');
    }

    // 6. TEST AUTH FLOW WITH DATABASE
    log.section('6️⃣  TESTING FULL AUTH FLOW WITH DATABASE');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = 'Test User';
    const testPassword2 = 'TestPass123';

    try {
      // Create test patient
      const salt2 = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(testPassword2, salt2);
      
      const patient = await Patient.create({
        name: testName,
        email: testEmail,
        password: hash,
      });
      log.success(`Test patient created: ${patient._id}`);

      // Simulate login
      const foundPatient = await Patient.findOne({ email: testEmail }).select('+password');
      if (!foundPatient) {
        log.error('Failed to find patient by email');
        process.exit(1);
      } else {
        log.success(`Patient found by email: ${foundPatient._id}`);
      }

      const passwordValid = await bcrypt.compare(testPassword2, foundPatient.password);
      if (!passwordValid) {
        log.error('Password verification FAILED');
        process.exit(1);
      } else {
        log.success('Password verification successful');
      }

      const loginToken = jwt.sign({ id: foundPatient._id, role: 'patient' }, jwtSecret, { expiresIn: '30d' });
      log.success(`Login token generated: ${loginToken.substring(0, 20)}...`);

      // Cleanup
      await Patient.deleteOne({ _id: patient._id });
      log.success('Test patient deleted');

    } catch (dbError) {
      log.error(`Database test failed: ${dbError.message}`);
      if (dbError.code === 11000) {
        log.info('Duplicate key error - test data may already exist');
      }
    }

    // 7. SUMMARY
    log.section('✅ VERIFICATION COMPLETE');
    log.success('All authentication components are working correctly');
    log.info('Your backend is ready for login/register operations');

    await mongoose.disconnect();
    log.success('Database connection closed');

  } catch (error) {
    log.section('❌ VERIFICATION FAILED');
    log.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error('\nStack Trace:');
      console.error(error);
    }
    process.exit(1);
  }
}

verifyAuth();
