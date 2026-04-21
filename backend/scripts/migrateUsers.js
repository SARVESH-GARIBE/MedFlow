import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import 'dotenv/config';
import { connectDB } from '../config/db.js';

const migrateUsers = async () => {
  try {
    console.log('🚀 Starting user migration...');

    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // Check if migration already completed
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Migration may have been completed already.');
      console.log(`Found ${existingUsers} users in the system.`);
      return;
    }

    // Migrate patients
    console.log('📋 Migrating patients...');
    const patients = await Patient.find({});
    console.log(`Found ${patients.length} patients to migrate`);

    for (const patient of patients) {
      // Skip patients without passwords or create default password
      if (!patient.password) {
        console.log(`⚠️  Skipping patient ${patient.email} - no password found`);
        continue;
      }

      const userData = {
        name: patient.name,
        email: patient.email,
        password: patient.password, // Keep existing hash
        role: 'patient',
        phone: patient.phone || '',
        gender: patient.gender || 'other',
        dateOfBirth: patient.dateOfBirth,
        assignedArea: {
          city: '',
          area: ''
        },
        verification: {
          isVerified: true // Patients are auto-verified
        },
        status: 'verified',
        isActive: patient.isActive
      };

      await User.create(userData);
    }
    console.log('✅ Patients migrated successfully');

    // Migrate doctors
    console.log('👨‍⚕️ Migrating doctors...');
    const doctors = await Doctor.find({});
    console.log(`Found ${doctors.length} doctors to migrate`);

    for (const doctor of doctors) {
      // Skip doctors without passwords
      if (!doctor.password) {
        console.log(`⚠️  Skipping doctor ${doctor.email} - no password found`);
        continue;
      }

      const userData = {
        name: doctor.name,
        email: doctor.email,
        password: doctor.password, // Keep existing hash
        role: 'doctor',
        phone: '',
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualifications: doctor.qualifications,
        location: doctor.location,
        about: doctor.about,
        locationDetails: doctor.locationDetails,
        clinicType: doctor.clinicType,
        fee: doctor.fee,
        availability: doctor.availability,
        schedule: doctor.schedule,
        success: doctor.success,
        patients: doctor.patients,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        imageUrl: doctor.imageUrl,
        imagePublicId: doctor.imagePublicId,
        assignedArea: {
          city: doctor.locationDetails?.city || '',
          area: doctor.locationDetails?.area || ''
        },
        verification: {
          documentType: 'medical_license',
          documentIdMasked: doctor.medicalRegistrationNumber ? `****${doctor.medicalRegistrationNumber.slice(-4)}` : '',
          isVerified: doctor.status === 'verified'
        },
        status: doctor.status,
        rejectionReason: doctor.rejectionReason,
        isActive: doctor.isActive
      };

      await User.create(userData);
    }
    console.log('✅ Doctors migrated successfully');

    // Create a super admin user
    console.log('👑 Creating super admin user...');
    const superAdminExists = await User.findOne({ role: 'super_admin' });
    if (!superAdminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@medflow.com',
        password: await import('bcrypt').then(bcrypt => bcrypt.hash('admin123', 10)),
        role: 'super_admin',
        assignedArea: {
          city: 'All Cities',
          area: 'All Areas'
        },
        verification: {
          isVerified: true
        },
        status: 'verified'
      });
      console.log('✅ Super admin created: admin@medflow.com / admin123');
    }

    console.log('🎉 Migration completed successfully!');

    // Show migration stats
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Migration Statistics:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} users`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration
migrateUsers();