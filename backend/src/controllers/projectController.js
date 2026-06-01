const Project = require('../models/Project');


module.exports.createProject = async (req, res) => {
  try {
    const {
      name,
      targetWebsite,
      categories,
      sensitiveTopics,
      projectObject,
      languages,
      countries,
      publishInstructions,
      targetPages
    } = req.body;

    // Validation Check (Backend safety net)
    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    // Naya project document create karein
    const newProject = await Project.create({
      user: req.user.id, // Auth Middleware se aane waali logged-in user ki ID
      name,
      targetWebsite,
      categories,
      sensitiveTopics,
      projectObject,
      languages,
      countries,
      publishInstructions,
      targetPages
    });

    res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
module.exports.getProjects = async (req, res) => {
  try {
    // Sirf us user ke projects fetch karein jo logged in hai
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Update a project
// @route   PUT /api/projects/:id
module.exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id; // Auth Middleware se user ID

    // 1. Pehle check karein ke project exist karta hai aur usi logged-in user ka hai
    let project = await Project.findOne({ _id: projectId, user: userId });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or you are not authorized to edit this project' 
      });
    }

    // 2. Request body se aane waale data ke sath update karein
    // { new: true, runValidators: true } se updated data return hoga aur schema validation run hogi
    project = await Project.findByIdAndUpdate(
      projectId,
      { $set: req.body }, // Yeh dynamic query automatically wahi fields update karegi jo body mein hain
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });

  } catch (error) {
    console.error('Error updating project:', error);
    
    // Agar Mongoose Object ID invalid ho tou handle karein
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid Project ID' });
    }

    res.status(500).json({ success: false, message: 'Server Error' });
  }
};