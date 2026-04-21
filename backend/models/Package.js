import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  testsIncluded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['health-checkup', 'diabetes', 'thyroid', 'cardiac', 'liver', 'kidney', 'cancer', 'women-health', 'men-health', 'senior-citizen']
  },
  reportTime: {
    type: String,
    required: true,
    default: '24-48 hours'
  },
  preparation: {
    type: String,
    default: ''
  },
  sampleCollection: {
    type: String,
    default: 'Home sample collection available'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for discount calculation
packageSchema.virtual('savings').get(function() {
  return this.originalPrice - this.discountedPrice;
});

// Ensure virtual fields are serialized
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

// Index for search
packageSchema.index({ name: 'text', description: 'text' });
packageSchema.index({ category: 1, isPopular: -1 });

export default mongoose.model('Package', packageSchema);