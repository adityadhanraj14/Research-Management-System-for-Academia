const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['CSE', 'ISE', 'AIML', 'EEE', 'ECE', 'Mechanical', 'Civil']
  },
  facultyCount: { type: Number, default: 0 },
  researchCounts: {
    total: { type: Number, default: 0 },
    researchPaper: { type: Number, default: 0 },
    journal: { type: Number, default: 0 },
    article: { type: Number, default: 0 },
    book: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Department', departmentSchema);