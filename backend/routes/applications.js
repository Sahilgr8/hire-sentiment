// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const pool = require('../database');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper function to run Python scripts with data
async function runPythonScript(scriptPath, data) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, JSON.stringify(data)]);
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${result}`));
        }
      }
    });
  });
}

// Apply for a job with candidate profile analysis
router.post('/apply/:jobId', function(req, res, next) {
  // Access the multer upload function from app.locals
  const upload = req.app.locals.upload;
  
  // Use single file upload middleware for resumeFile
  upload.single('resumeFile')(req, res, async function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Continue with application processing after file upload
    const { jobId } = req.params;
    const { applicantId, coverLetter, githubUsername, leetcodeUsername } = req.body;
    let resumePath = '';
    
    if (req.file) {
      resumePath = `/uploads/resumes/${req.file.filename}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }
    
    try {
      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Check if the job exists
        const jobResult = await client.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
        if (jobResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        // Check if the user has already applied for this job
        const existingApplication = await client.query(
          'SELECT * FROM applications WHERE job_id = $1 AND applicant_id = $2',
          [jobId, applicantId]
        );
        
        if (existingApplication.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'You have already applied for this job' 
          });
        }
        
        // Create a new application record
        const applicationResult = await client.query(
          `INSERT INTO applications 
           (job_id, applicant_id, resume_path, cover_letter, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
           RETURNING id`,
          [jobId, applicantId, resumePath, coverLetter]
        );
        
        const applicationId = applicationResult.rows[0].id;
        
        // Update or create applicant profile with URLs if provided
        if (githubUsername || leetcodeUsername) {
          // Check if profile exists
          const profileCheck = await client.query(
            'SELECT user_id FROM applicant_profiles WHERE user_id = $1',
            [applicantId]
          );
          
          if (profileCheck.rows.length > 0) {
            // Update existing profile
            await client.query(
              `UPDATE applicant_profiles 
               SET github_url = COALESCE($1, github_url),
                   leetcode_url = COALESCE($2, leetcode_url),
                   updated_at = NOW()
               WHERE user_id = $3`,
              [
                githubUsername ? `https://github.com/${githubUsername}` : null,
                leetcodeUsername ? `https://leetcode.com/${leetcodeUsername}` : null,
                applicantId
              ]
            );
          } else {
            // Create new profile
            await client.query(
              `INSERT INTO applicant_profiles 
               (user_id, github_url, leetcode_url, created_at, updated_at)
               VALUES ($1, $2, $3, NOW(), NOW())`,
              [
                applicantId,
                githubUsername ? `https://github.com/${githubUsername}` : null,
                leetcodeUsername ? `https://leetcode.com/${leetcodeUsername}` : null
              ]
            );
          }
        }
        
        await client.query('COMMIT');
        
        // Analyze GitHub and LeetCode profiles if usernames are provided
        if (githubUsername || leetcodeUsername) {
          // Run profile analysis in the background
          analyzeProfiles(applicationId, githubUsername, leetcodeUsername)
            .then((profileData) => {
              // Store profile data in the database
              updateProfileData(applicationId, profileData);
            })
            .catch((error) => {
              console.error(`Error analyzing profiles: ${error}`);
            });
            
          // Don't wait for profile analysis to complete before responding
          return res.status(201).json({
            success: true,
            message: 'Application submitted successfully. Profile analysis in progress.',
            applicationId
          });
        } else {
          // No profile analysis needed
          return res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            applicationId
          });
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error applying for job: ${error}`);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: error.message
      });
    }
  });
});

// Get all applications for a job
router.get('/job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id, a.applicant_id, a.resume_path, a.cover_letter, a.status, 
              a.created_at, a.updated_at, u.email,
              ap.github_url, ap.leetcode_url, 
              ap.profile_image_url, ap.profile_data
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       LEFT JOIN applicant_profiles ap ON u.id = ap.user_id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    );
    res.json({
      success: true,
      applications: result.rows
    });
  } catch (error) {
    console.error(`Error fetching applications: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get all applications by a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id, a.job_id, a.resume_path, a.cover_letter, a.status, 
              a.created_at, a.updated_at,
              j.title as job_title, j.company as company_name, j.location as job_location
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    res.json({
      success: true,
      applications: result.rows
    });
  } catch (error) {
    console.error(`Error fetching user applications: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get detailed application info with profile analysis
router.get('/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id, a.job_id, a.applicant_id, a.resume_path, a.cover_letter, 
              a.status, a.created_at, a.updated_at, a.profile_data,
              j.title as job_title, j.company as company_name, 
              j.description as job_description, j.requirements as job_requirements,
              u.email, ap.github_url, ap.leetcode_url, 
              ap.profile_image_url
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.applicant_id = u.id
       LEFT JOIN applicant_profiles ap ON u.id = ap.user_id
       WHERE a.id = $1`,
      [applicationId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    res.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error(`Error fetching application details: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
});

// Update application status
router.put('/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'reviewing', 'rejected', 'shortlisted', 'interviewing', 'offered', 'hired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }
  
  try {
    const result = await pool.query(
      `UPDATE applications 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, applicationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Application status updated',
      application: result.rows[0]
    });
  } catch (error) {
    console.error(`Error updating application status: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// Helper function to analyze GitHub and LeetCode profiles
async function analyzeProfiles(applicationId, githubUsername, leetcodeUsername) {
  // Create a Python script caller to use our ProfileScraper
  const scriptPath = path.join(__dirname, '../Persona-Lens/analyze_profiles.py');
  
  const data = {
    application_id: applicationId,
    github_username: githubUsername || '',
    leetcode_username: leetcodeUsername || ''
  };
  
  try {
    return await runPythonScript(scriptPath, data);
  } catch (error) {
    console.error(`Error running profile analysis: ${error}`);
    throw error;
  }
}

// Helper function to update profile data in the applications table
async function updateProfileData(applicationId, profileData) {
  try {
    const client = await pool.connect();
    try {
      // Store profile data as JSON in the applications table
      await client.query(
        `UPDATE applications 
         SET profile_data = $1, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(profileData), applicationId]
      );
      
      // Also update applicant_profiles table with Github and LeetCode URLs
      if (profileData.github_username || profileData.leetcode_username) {
        const appResult = await client.query(
          'SELECT applicant_id FROM applications WHERE id = $1',
          [applicationId]
        );
        
        if (appResult.rows.length > 0) {
          const applicantId = appResult.rows[0].applicant_id;
          
          // Check if profile exists
          const profileCheck = await client.query(
            'SELECT user_id FROM applicant_profiles WHERE user_id = $1',
            [applicantId]
          );
          
          if (profileCheck.rows.length > 0) {
            // Update existing profile
            await client.query(
              `UPDATE applicant_profiles 
               SET github_url = COALESCE($1, github_url),
                   leetcode_url = COALESCE($2, leetcode_url),
                   updated_at = NOW()
               WHERE user_id = $3`,
              [
                profileData.github_username ? `https://github.com/${profileData.github_username}` : null,
                profileData.leetcode_username ? `https://leetcode.com/${profileData.leetcode_username}` : null,
                applicantId
              ]
            );
          } else {
            // Create new profile
            await client.query(
              `INSERT INTO applicant_profiles 
               (user_id, github_url, leetcode_url, created_at, updated_at)
               VALUES ($1, $2, $3, NOW(), NOW())`,
              [
                applicantId,
                profileData.github_username ? `https://github.com/${profileData.github_username}` : null,
                profileData.leetcode_username ? `https://leetcode.com/${profileData.leetcode_username}` : null
              ]
            );
          }
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating profile data: ${error}`);
    throw error;
  }
}

module.exports = router;