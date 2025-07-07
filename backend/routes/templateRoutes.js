const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplateById,
  getTemplateCategories,
  getTemplatesWithUsage,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateStats, // <-- This is correctly imported
} = require('../controllers/templateController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for templates!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Public routes
router.get('/', getTemplates);
router.get('/categories', getTemplateCategories);

// *** CRITICAL REORDERING FOR /api/templates ROUTES ***
// More specific routes must come before general dynamic routes (like /:id)

// Private routes for users/admins to get templates with usage or stats
router.get('/with-usage', protect, getTemplatesWithUsage); // Existing specific route
router.get('/stats', protect, authorizeAdmin, getTemplateStats); // <<<--- NEW: This route MUST come before /:id

// General route for single template by ID - now correctly placed AFTER more specific routes
router.get('/:id', getTemplateById); 
// *******************************************************************


// Admin routes (protected and authorized) for CUD operations
router.post('/', protect, authorizeAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewImages', maxCount: 5 }
]), createTemplate);
router.put('/:id', protect, authorizeAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewImages', maxCount: 5 }
]), updateTemplate);
router.delete('/:id', protect, authorizeAdmin, deleteTemplate);

module.exports = router;