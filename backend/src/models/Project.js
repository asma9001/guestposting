const mongoose = require('mongoose');

const TargetPageSchema = new mongoose.Schema({
  anchor: { type: String, required: true },
  url: { type: String, required: true }
});

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Kis advertiser ne project banaya
  },
  name: { 
    type: String, 
    required: [true, 'Project name is required'],
    trim: true 
  },
  targetWebsite: { type: String, trim: true },
  projectObject: { type: String, default: 'General' },
  publishInstructions: { type: String },
  categories: [{ type: String }],
  sensitiveTopics: [{ type: String }],
  languages: [{ type: String }],
  countries: [{ type: String }],
  targetPages: [TargetPageSchema], // Embedded sub-document array
  status: { 
    type: String, 
    enum: ['active', 'archived', 'completed'], 
    default: 'active' 
  },
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);