const Admin = require('../models/adminModel'); // Update with correct model path
const JobSeekkers = require('../models/jobseekerModel'); // Replace with your actual Job Seeker model path
const Recruiters = require('../models/recruiterModel'); // Replace with your actual Recruiter model path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const faqs = require('../models/faqModel')
// Predefined Admin Credentials
const predefinedAdmin = {
    email: process.env.ADMINEMAIL, // admin email
    password: process.env.ADMINPASSWORD // admin password
};

// Admin Login Controller
exports.adminLoginController = async (req, res) => {
    console.log("Inside adminLoginController");
    const { email, password } = req.body;

    try {
        // Check if email matches predefined admin email
        if (email !== predefinedAdmin.email) {
            return res.status(404).json("Invalid admin email.");
        }

        // Compare password with predefined password
        const isPasswordValid = password === predefinedAdmin.password;
        if (!isPasswordValid) {
            return res.status(401).json("Incorrect admin password.");
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: predefinedAdmin.email },
            process.env.JWTPASSWORD // Ensure JWTPASSWORD is defined in .env
        );

        // Send response with email and token
        res.status(200).json({
            email: predefinedAdmin.email, // Include predefinedAdmin.email explicitly
            message: "Admin login successful",
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("An error occurred during admin login.");
    }
};


// View Total Registered Job Seekers and Recruiters
exports.viewStatsController = async (req, res) => {
    console.log("Inside viewStatsController");

    try {
        // Fetch counts for job seekers and recruiters
        const totalJobSeekers = await JobSeekkers.countDocuments();
        const totalRecruiters = await Recruiters.countDocuments();

        // Send response with counts
        res.status(200).json({
            totalJobSeekers,
            totalRecruiters
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("An error occurred while fetching stats.");
    }
};



// Add FAQ Controller
exports.addFaqController = async (req, res) => {
    console.log("Inside addFaqController");
    try {
        // Extracting question and answer from the request body
        const { question, answer } = req.body;

        // Validate input
        if (!question || !answer) {
            return res.status(400).json({ message: "Question and Answer are required." });
        }

        // Create a new FAQ document
        const addFaq = new faqs({
            question,
            answer
        });

        // Save to the database
        await addFaq.save();

        // Respond with success message
        res.status(201).json({ alert: "FAQ added successfully!", faq: addFaq });
    } catch (err) {
        console.error("Error in addFaqController:", err);
        res.status(401).json({ message: "Failed to add FAQ.", error: err.message });
    }
};

// Get Added FAQs Controller
// exports.getAddedFaqController = async (req, res) => {
//     console.log("Inside getAddedFaqController");

//     try {
//         // Fetch all FAQs from the database
//         const faq = await faqs.find()

//         // Check if FAQs exist
//         if (!faq| faqength === 0) {
//             return res.status(404).json({ message: "No FAQs found." });
//         }

//         // Respond with the fetched FAQs
//         res.status(200).json({ message: "FAQs retrieved successfully!", faqs });
//     } catch (err) {
//         res.status(401).json(err);
//     }
// };

// Get Added FAQs Controller
exports.getAddedFaqController = async (req, res) => {
    console.log("Inside getAddedFaqController");

    try {
        // Fetch all FAQs from the database
        const faqList = await faqs.find(); // Ensure the correct model is used

        // Check if FAQs exist
        if (!faqList || faqList.length === 0) {
            return res.status(404).json({ message: "No FAQs found." });
        }

        // Respond with the fetched FAQs
        res.status(200).json({
            message: "FAQs retrieved successfully!",
            faqs: faqList, // Use a descriptive variable name
        });
    } catch (err) {
        console.error("Error fetching FAQs:", err.message);
        res.status(500).json({
            message: "Failed to retrieve FAQs.",
            error: err.message,
        });
    }
};


//delete faq
// Delete FAQ by ID
exports.deleteFaqController = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedFaq = await faqs.findByIdAndDelete(id);
  
      if (!deletedFaq) {
        return res.status(404).json({ message: 'FAQ not found.' });
      }
  
      res.status(200).json({ message: 'FAQ deleted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting FAQ.', error });
    }
  };
  
//update
exports.updateFaq = async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
  
    // Input validation
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required.' });
    }
  
    try {
      const updatedFaq = await faqs.findByIdAndUpdate(
        id,
        { question, answer },
        { new: true } // Return the updated document
      );
  
      if (!updatedFaq) {
        return res.status(404).json({ message: 'FAQ not found.' });
      }
  
      res.status(200).json({ message: 'FAQ updated successfully!', faq: updatedFaq });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ message: 'Error updating FAQ.', error });
    }
  };
  