
// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../database'); // Import the config
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png', 
    'image/jpeg'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PNG, and JPEG files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to create/update applicant profile
router.post('/api/profile', upload.single('resume'), async (req, res) => {
  try {
    const { userId, githubUrl, leetcodeUrl, linkedinUrl } = req.body;
    
    // Get resume file path if uploaded
    const resumePath = req.file ? req.file.path : null;
    
    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT * FROM applicant_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE applicant_profiles 
         SET resume = $2, github_url = $3, leetcode_url = $4, linkedin_url = $5
         WHERE user_id = $1`,
        [userId, resumePath, githubUrl, leetcodeUrl, linkedinUrl]
      );
    } else {
      // Create new profile
      await pool.query(
        `INSERT INTO applicant_profiles 
         (user_id, resume, github_url, leetcode_url, linkedin_url) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, resumePath, githubUrl, leetcodeUrl, linkedinUrl]
      );
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Profile updated successfully',
      data: {
        resumePath: resumePath ? path.basename(resumePath) : null
      }
    });
    
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get applicant profile
router.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profileResult = await pool.query(
      'SELECT * FROM applicant_profiles WHERE user_id = $1',
      [userId]
    );
    
    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows[0];
      res.status(200).json({ 
        success: true,
        data: profile
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Profile not found'
      });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
