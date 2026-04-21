import Package from '../models/Package.js';

// Get all packages with filtering
const getPackages = async (req, res) => {
  try {
    const { category, popular, limit = 20 } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (popular === 'true') {
      query.isPopular = true;
    }

    const packages = await Package.find(query)
      .populate('testsIncluded', 'name price category')
      .sort({ isPopular: -1, discountedPrice: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: packages,
      count: packages.length
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id)
      .populate('testsIncluded', 'name price category description sampleType');

    if (!pkg || !pkg.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: error.message
    });
  }
};

// Get packages by category
const getPackagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const packages = await Package.find({
      category,
      isActive: true
    })
      .populate('testsIncluded', 'name price category')
      .sort({ isPopular: -1, discountedPrice: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: packages,
      count: packages.length
    });
  } catch (error) {
    console.error('Error fetching packages by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages by category',
      error: error.message
    });
  }
};

// Get popular packages
const getPopularPackages = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const packages = await Package.find({
      isPopular: true,
      isActive: true
    })
      .populate('testsIncluded', 'name price category')
      .sort({ discountedPrice: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: packages,
      count: packages.length
    });
  } catch (error) {
    console.error('Error fetching popular packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular packages',
      error: error.message
    });
  }
};

export {
  getPackages,
  getPackageById,
  getPackagesByCategory,
  getPopularPackages
};