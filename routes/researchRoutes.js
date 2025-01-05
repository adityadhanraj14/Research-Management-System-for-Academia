const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { requireAuth,checkUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',checkUser,researchController.get_home);
router.get('/post', requireAuth, researchController.post_get);
router.post('/post', requireAuth, upload.single('pdf'), researchController.post_paper);
router.get('/view/:id', researchController.view_paper);
router.post('/appreciate',requireAuth, researchController.toggleAppreciation);
// router.get('/download/:id', researchController.download_paper);

module.exports = router;