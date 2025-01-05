const ResearchPaper = require('../models/ResearchPaper');
const Department = require('../models/Department');
const User = require('../models/User');
const Appreciation = require('../models/Appreciation');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { Types } = mongoose;


exports.get_home = async (req, res) => {
  try {
    // Fetch department statistics
    const departments = await Department.find().select('name facultyCount researchCounts');

    // Fetch top 10 research papers based on appreciation count
    const topPapers = await ResearchPaper.find()
      .sort({ appreciationCount: -1 })
      .limit(10)
      .populate('primaryAuthor', 'name');

    // Fetch recent research papers
    const randomPapers = await ResearchPaper.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('primaryAuthor', 'name');

    // Fetch faculty statistics from User model based on designation
    const facultyStats = await User.aggregate([
      { $group: { _id: "$designation", count: { $sum: 1 } } },
      { $project: { designation: "$_id", count: 1, _id: 0 } }
    ]);

    // Fetch research statistics based on category from ResearchPaper model
    const stats = {
      total: await ResearchPaper.countDocuments(),
      journal: await ResearchPaper.countDocuments({ category: 'Journal' }),
      article: await ResearchPaper.countDocuments({ category: 'Article' }),
      book: await ResearchPaper.countDocuments({ category: 'Book' }),
      researchPaper: await ResearchPaper.countDocuments({ category: 'Research Paper' }),
    };

    // Render the page with the fetched data
    res.render('home', {
      user: res.locals.user,
      // req.user || null, // Include logged-in user details if available
      departments,
      topPapers,
      randomPapers,
      facultyStats,
      stats,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).send('Internal Server Error');
  }
};



exports.post_get = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().populate('department'); // Assuming `department` is a reference in the User model

    // Render the research post page with users data
    res.render('research/post', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.post_paper = async (req, res) => {
  try {
    // console.log('Creating research paper...');

    const { title, category, abstract, coAuthors, dateOfPublish } = req.body;

    // Ensure the user is logged in
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    // Ensure file upload exists
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }
    const pdfPath = req.file.path;

    // Ensure required fields exist
    if (!title || !category || !abstract || !dateOfPublish) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate category
    const validCategories = ['Research Paper', 'Article', 'Journal', 'Book'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Allowed values: ${validCategories.join(', ')}` });
    }

    // Process coAuthors
    let authors = [req.user._id]; // Add the logged-in user as the primary author

    if (coAuthors) {
      // Convert coAuthors into an array if it is a string
      let coAuthorIds = Array.isArray(coAuthors) ? coAuthors : coAuthors.split(',');

      // Validate and sanitize coAuthorIds
      coAuthorIds = coAuthorIds
        .map((id) => id.trim()) // Trim whitespace
        .filter((id) => Types.ObjectId.isValid(id)); // Keep only valid ObjectId

      authors.push(...coAuthorIds); // Add valid co-authors to authors array
    }

    // Remove duplicates
    authors = [...new Set(authors)];

    // Step 1: Create a new research paper document
    const paper = await ResearchPaper.create({
      title,
      category,
      abstract,
      primaryAuthor: req.user._id, // Use the logged-in user as the primary author
      coAuthors: authors.slice(1), // All authors except the primary author are co-authors
      dateOfPublish,
      researchId: uuidv4(),
      pdfPath,
    });
    // console.log('Research paper created:', paper);

    // Step 2: Update the department data
    const user = await User.findById(req.user._id);
    const departmentName = user.department;

    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      return res.status(404).send('Department not found');
    }

    // Update department's research counts
    department.researchCounts.total += 1;
    if (category === 'Research Paper') {
      department.researchCounts.researchPaper += 1;
    } else if (category === 'Article') {
      department.researchCounts.article += 1;
    } else if (category === 'Journal') {
      department.researchCounts.journal += 1;
    } else if (category === 'Book') {
      department.researchCounts.book += 1;
    }

    // Save the department with updated counts
    await department.save();

    // Respond with a success message
    res.status(201).json({
      message: 'Research paper uploaded successfully.',
      paper,
    });
  } catch (error) {
    console.error('Error handling research paper and department:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
};

exports.view_paper = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id)
      .populate('primaryAuthor', 'name department profilePic') // Populates primary author details
      .populate('coAuthors', 'name department'); // Populates co-authors details

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.render('research/viewPaper', { paper });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.appreciate_paper = async (req, res) => {
  try {
    const appreciation = await Appreciation.create({
      userId: req.user.id,
      researchId: req.params.id
    });

    await ResearchPaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { appreciationCount: 1 } }
    );

    res.status(200).json({ message: 'Paper appreciated' });
  } catch (err) {
    res.status(400).json({ error: 'Already appreciated' });
  }
};

exports.toggleAppreciation = async (req, res) => {
  const { paperId } = req.body;  // Paper ID from the request body
  const userId = req.user._id;   // User ID from the session or JWT token

  try {
    // Check if the user has already appreciated this paper
    const existingAppreciation = await Appreciation.findOne({ userId, researchId: paperId });

    if (existingAppreciation) {
      // If the user already appreciated, remove the appreciation
      await existingAppreciation.remove();

      // Update the ResearchPaper model by decrementing the appreciation count
      await ResearchPaper.findByIdAndUpdate(paperId, { 
        $pull: { appreciatedBy: userId },
        $inc: { appreciationCount: -1 }
      });

      return res.status(200).json({ success: true, message: 'Appreciation removed' });
    } else {
      // If the user hasn't appreciated, create a new appreciation
      const newAppreciation = new Appreciation({
        userId,
        researchId: paperId
      });
      await newAppreciation.save();

      // Update the ResearchPaper model by incrementing the appreciation count
      await ResearchPaper.findByIdAndUpdate(paperId, { 
        $push: { appreciatedBy: userId },
        $inc: { appreciationCount: 1 }
      });

      return res.status(200).json({ success: true, message: 'Appreciation added' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', message: err.message });
  }
};
