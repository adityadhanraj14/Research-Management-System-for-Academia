const mongoose = require('mongoose');

const researchPaperSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Research Paper', 'Article', 'Journal', 'Book'], 
    required: true 
  },
  abstract: { type: String, required: true, trim: true },
  primaryAuthor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  coAuthors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  dateOfPublish: { 
    type: Date, 
    required: true, 
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date of publish cannot be in the future.'
    }
  },
  researchId: { type: String, unique: true, required: true },
  pdfPath: { type: String, required: true },
  appreciationCount: { type: Number, default: 0 },
  appreciatedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('ResearchPaper', researchPaperSchema);
