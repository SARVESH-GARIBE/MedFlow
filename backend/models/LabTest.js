import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['blood', 'urine', 'imaging', 'cardiac', 'diabetes', 'thyroid', 'liver', 'kidney', 'cancer', 'infection', 'hormone', 'vitamin']
  },
  reportTime: {
    type: String,
    required: true,
    default: '24 hours'
  },
  preparation: {
    type: String,
    default: ''
  },
  sampleType: {
    type: String,
    required: true,
    enum: ['blood', 'urine', 'stool', 'saliva', 'swab']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
labTestSchema.index({ name: 'text', description: 'text' });
labTestSchema.index({ category: 1, isPopular: -1 });

export default mongoose.model('LabTest', labTestSchema);