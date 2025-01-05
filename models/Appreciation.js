const mongoose = require('mongoose');

const appreciationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  researchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ResearchPaper', 
    required: true 
  }
}, { timestamps: true });

// Ensure a user can only appreciate a paper once
appreciationSchema.index({ userId: 1, researchId: 1 }, { unique: true });

module.exports = mongoose.model('Appreciation', appreciationSchema);