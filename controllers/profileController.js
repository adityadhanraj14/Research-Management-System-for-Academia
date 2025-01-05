const User = require('../models/User');
const ResearchPaper = require('../models/ResearchPaper');

exports.view_profile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const papers = await ResearchPaper.find({ primaryAuthor: user._id })
      .populate('primaryAuthor', 'name');
    
    const stats = {
      total: papers.length,
      researchPaper: papers.filter(p => p.category === 'Research Paper').length,
      journal: papers.filter(p => p.category === 'Journal').length,
      article: papers.filter(p => p.category === 'Article').length,
      book: papers.filter(p => p.category === 'Book').length
    };

    res.render('profile/view', { profile: user, papers, stats });
  } catch (err) {
    res.status(404).json({ error: 'User not found'});
  }
};

exports.edit_profile_get = async (req, res) => {
  // console.log("GET /profile/edit triggered"+ req.user);
  res.render('profile/updateProfile', { user: req.user });
};



exports.edit_profile_post = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      department: req.body.department,
      designation: req.body.designation,
    };

    if (req.file) {
      updates.profilePic = req.file.filename; // Store the uploaded file name
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    );

    res.redirect(`/profile/${user._id}`); // Redirect back to profile page after successful update
  } catch (err) {
    res.status(400).send(err.message); // Handle errors gracefully
  }
};
