// backend/routes/persona-lens.js
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const pool = require('../database');

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

// Search for candidates based on skills and requirements
router.post('/search', async (req, res) => {
  const { query, jobId } = req.body;
  
  try {
    // Get job requirements if jobId is provided
    let jobRequirements = [];
    if (jobId) {
      const jobResult = await pool.query('SELECT requirements FROM jobs WHERE id = $1', [jobId]);
      if (jobResult.rows.length > 0 && jobResult.rows[0].requirements) {
        jobRequirements = jobResult.rows[0].requirements;
      }
    }
    
    // Prepare data for Python script
    const scriptPath = path.join(__dirname, '../Persona-Lens/llm_interface.py');
    const data = {
      query,
      requirements: jobRequirements
    };
    
    // Run Python script
    const candidateResults = await runPythonScript(scriptPath, data);
    
    res.json({
      success: true,
      results: candidateResults
    });
  } catch (error) {
    console.error('Error searching for candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for candidates',
      error: error.message
    });
  }
});

// Match job to candidates
router.post('/match-job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    // Get job details
    const jobResult = await pool.query(
      'SELECT title, description, requirements, skills FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const job = jobResult.rows[0];
    
    // Get all applications for this job with profile data
    const applicationsResult = await pool.query(
      `SELECT a.id, a.applicant_id, a.profile_data, u.email,
              ap.github_url, ap.leetcode_url
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       LEFT JOIN applicant_profiles ap ON u.id = ap.user_id
       WHERE a.job_id = $1 AND a.profile_data IS NOT NULL`,
      [jobId]
    );
    
    // If no applications with profile data found, return empty results
    if (applicationsResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No applications with profile data found',
        matches: []
      });
    }
    
    // Run matching algorithm using Persona-Lens
    const scriptPath = path.join(__dirname, '../Persona-Lens/match_job.py');
    const data = {
      job,
      applications: applicationsResult.rows
    };
    
    // This is a placeholder for the actual matching algorithm
    // In a real implementation, we would run a Python script
    // For now, simulate results based on available profile data
    const matches = applicationsResult.rows.map(app => {
      let matchScore = 0;
      let matchReasons = [];
      
      try {
        // Parse profile data if available
        if (app.profile_data) {
          const profileData = JSON.parse(app.profile_data);
          
          // Calculate simple match score based on languages and skills
          // This is just a placeholder for the actual algorithm
          const jobSkills = job.skills || [];
          const candidateLanguages = Object.keys(profileData.languages || {});
          
          // Count matching skills
          const matchingSkills = jobSkills.filter(skill => 
            candidateLanguages.some(lang => lang.toLowerCase().includes(skill.toLowerCase()))
          );
          
          // Calculate match score (0-100)
          matchScore = Math.min(100, Math.round((matchingSkills.length / Math.max(1, jobSkills.length)) * 100));
          
          // Add reasons
          if (matchingSkills.length > 0) {
            matchReasons.push(`Candidate has ${matchingSkills.length} of ${jobSkills.length} required skills`);
          }
          
          if (profileData.experience_years > 0) {
            matchReasons.push(`${profileData.experience_years} years of coding experience`);
          }
          
          if (profileData.overall_score && profileData.overall_score.total > 70) {
            matchReasons.push(`Strong overall developer score (${profileData.overall_score.total}/100)`);
          }
        }
      } catch (e) {
        console.error('Error calculating match score:', e);
      }
      
      return {
        application_id: app.id,
        applicant_id: app.applicant_id,
        email: app.email,
        match_score: matchScore,
        match_reasons: matchReasons
      };
    });
    
    // Sort matches by score
    const sortedMatches = matches.sort((a, b) => b.match_score - a.match_score);
    
    res.json({
      success: true,
      matches: sortedMatches
    });
  } catch (error) {
    console.error('Error matching job to candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to match job to candidates',
      error: error.message
    });
  }
});

// Analyze candidate profile using GitHub and LeetCode data
router.post('/analyze-profile', async (req, res) => {
  const { githubUsername, leetcodeUsername } = req.body;
  
  if (!githubUsername && !leetcodeUsername) {
    return res.status(400).json({
      success: false,
      message: 'At least one of githubUsername or leetcodeUsername is required'
    });
  }
  
  try {
    // Run profile analysis
    const scriptPath = path.join(__dirname, '../Persona-Lens/analyze_profiles.py');
    const data = {
      github_username: githubUsername || '',
      leetcode_username: leetcodeUsername || ''
    };
    
    const profileData = await runPythonScript(scriptPath, data);
    
    res.json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Error analyzing profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze profile',
      error: error.message
    });
  }
});

module.exports = router;