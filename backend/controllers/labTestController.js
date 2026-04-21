import LabTest from '../models/LabTest.js';

// Get all lab tests with filtering
const getLabTests = async (req, res) => {
  try {
    const { category, search, popular, limit = 50 } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (popular === 'true') {
      query.isPopular = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const tests = await LabTest.find(query)
      .sort({ isPopular: -1, name: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message
    });
  }
};

// Get lab test by ID
const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await LabTest.findById(id);

    if (!test || !test.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Error fetching lab test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test',
      error: error.message
    });
  }
};

// Get lab tests by category
const getLabTestsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const tests = await LabTest.find({
      category,
      isActive: true
    })
      .sort({ isPopular: -1, name: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error fetching lab tests by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests by category',
      error: error.message
    });
  }
};

// Search lab tests
const searchLabTests = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const tests = await LabTest.find({
      $text: { $search: q },
      isActive: true
    }, {
      score: { $meta: 'textScore' }
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error searching lab tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search lab tests',
      error: error.message
    });
  }
};

export {
  getLabTests,
  getLabTestById,
  getLabTestsByCategory,
  searchLabTests
};