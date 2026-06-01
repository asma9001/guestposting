const express = require('express');
const router = express.Router();
const { createProject, getProjects ,updateProject} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware'); // Aapka JWT auth middleware

// Dono routes protected hain, token lazmi hai
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);
router.route('/:id').put(protect, updateProject);
module.exports = router;