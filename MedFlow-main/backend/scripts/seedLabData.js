const mongoose = require('mongoose');
const LabTest = require('../models/LabTest');
const Package = require('../models/Package');
require('dotenv').config();

const labTestsData = [
  {
    name: "Thyroid Profile",
    description: "Comprehensive thyroid function test including T3, T4, TSH",
    price: 800,
    category: "thyroid",
    reportTime: "24 hours",
    preparation: "No special preparation required",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Complete Blood Count (CBC)",
    description: "Complete blood analysis including hemoglobin, WBC, platelets",
    price: 300,
    category: "blood",
    reportTime: "6 hours",
    preparation: "Fasting not required",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Lipid Profile",
    description: "Cholesterol and triglyceride levels assessment",
    price: 500,
    category: "cardiac",
    reportTime: "12 hours",
    preparation: "10-12 hours fasting required",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Liver Function Test",
    description: "Comprehensive liver health assessment",
    price: 600,
    category: "liver",
    reportTime: "24 hours",
    preparation: "No special preparation",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Kidney Function Test",
    description: "Renal function assessment with creatinine and urea",
    price: 400,
    category: "kidney",
    reportTime: "12 hours",
    preparation: "No special preparation",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Blood Sugar (Fasting)",
    description: "Fasting blood glucose level test",
    price: 150,
    category: "diabetes",
    reportTime: "4 hours",
    preparation: "8-10 hours fasting required",
    sampleType: "blood",
    isPopular: true
  },
  {
    name: "Dengue Test",
    description: "Dengue NS1 antigen and antibody test",
    price: 1200,
    category: "infection",
    reportTime: "24 hours",
    preparation: "No special preparation",
    sampleType: "blood",
    isPopular: false
  },
  {
    name: "Vitamin D Test",
    description: "25-hydroxy vitamin D level assessment",
    price: 1500,
    category: "vitamin",
    reportTime: "48 hours",
    preparation: "No special preparation",
    sampleType: "blood",
    isPopular: false
  }
];

const packagesData = [
  {
    name: "Full Body Checkup",
    description: "Comprehensive health screening package for overall wellness",
    originalPrice: 2500,
    discountedPrice: 1800,
    discountPercentage: 28,
    category: "health-checkup",
    reportTime: "24-48 hours",
    preparation: "10-12 hours fasting required",
    sampleCollection: "Home sample collection available",
    isPopular: true,
    testsIncluded: [] // Will be populated after creating tests
  },
  {
    name: "Diabetes Care Package",
    description: "Complete diabetic profile with HbA1c and glucose monitoring",
    originalPrice: 1200,
    discountedPrice: 900,
    discountPercentage: 25,
    category: "diabetes",
    reportTime: "12 hours",
    preparation: "Fasting required for some tests",
    sampleCollection: "Home sample collection available",
    isPopular: true,
    testsIncluded: []
  },
  {
    name: "Cardiac Health Package",
    description: "Comprehensive heart health assessment",
    originalPrice: 1800,
    discountedPrice: 1350,
    discountPercentage: 25,
    category: "cardiac",
    reportTime: "24 hours",
    preparation: "10-12 hours fasting required",
    sampleCollection: "Home sample collection available",
    isPopular: true,
    testsIncluded: []
  },
  {
    name: "Thyroid Health Package",
    description: "Complete thyroid function assessment",
    originalPrice: 1000,
    discountedPrice: 750,
    discountPercentage: 25,
    category: "thyroid",
    reportTime: "24 hours",
    preparation: "No special preparation",
    sampleCollection: "Home sample collection available",
    isPopular: false,
    testsIncluded: []
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await LabTest.deleteMany({});
    await Package.deleteMany({});
    console.log('Cleared existing data');

    // Insert lab tests
    const insertedTests = await LabTest.insertMany(labTestsData);
    console.log(`Inserted ${insertedTests.length} lab tests`);

    // Update packages with test references
    packagesData[0].testsIncluded = insertedTests.slice(0, 4).map(test => test._id); // Full body: CBC, Lipid, Liver, Kidney
    packagesData[1].testsIncluded = insertedTests.filter(test => test.category === 'diabetes').map(test => test._id); // Diabetes tests
    packagesData[2].testsIncluded = insertedTests.filter(test => test.category === 'cardiac').map(test => test._id); // Cardiac tests
    packagesData[3].testsIncluded = insertedTests.filter(test => test.category === 'thyroid').map(test => test._id); // Thyroid tests

    // Insert packages
    const insertedPackages = await Package.insertMany(packagesData);
    console.log(`Inserted ${insertedPackages.length} packages`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();