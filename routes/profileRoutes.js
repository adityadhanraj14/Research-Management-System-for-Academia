const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/edit', requireAuth, profileController.edit_profile_get);
router.post('/edit', requireAuth, upload.single('profilePic'), profileController.edit_profile_post);
router.get('/:id', profileController.view_profile);

module.exports = router;