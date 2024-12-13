const recruiters = require('../models/recruiterModel')
const bycrpt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const job = require('../models/jobModel');
const jobs = require('../models/jobModel');
// const JWTPASSWORD = require('')
//recruiter register
exports.recruiterRegisterContoller = async (req, res) => {
    console.log("inisde recruiterRegisterContoller");
    // console.log(req.body);
    const { company, email, password } = req.body
    try {
        const existingRecruiter = await recruiters.findOne({ email })
        if (existingRecruiter) {
            res.status(406).json("Already Registered Recruiter...Please Login!!")
        }
        else {
            const saltRounds = 10
            const hashedPassword = await bycrpt.hash(password, saltRounds)
            console.log(`Hashed Password: ${hashedPassword}`);

            const newRecruiter = new recruiters({
                company, email, password: hashedPassword, phone: "", jobsPosted: [], profilePic: ""
            })
            await newRecruiter.save()
            res.status(200).json(newRecruiter)
        }
    } catch (err) {
        res.status(401).json(err)
    }
}

//recruiter login

exports.recruiterLoginController = async (req, res) => {
    console.log("Inside recruiterLogin");
    const { email, password } = req.body;
    console.log(email, password);

    try {
        const existingRecruiter = await recruiters.findOne({ email });
        if (existingRecruiter) {
            console.log("Stored user details:", existingRecruiter);
            const decryptPassword = await bycrpt.compare(password, existingRecruiter.password);
            console.log("Password match:", decryptPassword);

            if (decryptPassword) {
                // Token generation with correct field name
                const token = jwt.sign(
                    { recruiterId: existingRecruiter._id, role: "recruiter" }, // Corrected field name
                    process.env.JWTPASSWORD,
                );
                res.status(200).json({ recruiter: existingRecruiter, token });
            } else {
                res.status(404).json("Incorrect Password.");
            }
        } else {
            res.status(404).json("Incorrect email");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
};

//addjobpost
exports.addJobController = async (req, res) => {
    console.log("inside addjobController");

    try {
        const { title, description, company, location, minPrice, maxPrice, employmenttype, experience, requirements } = req.body;
        const logo = req.file.filename // Only use the file path (or a URL) for the logo
        console.log(title, description, company, location, minPrice, maxPrice, employmenttype, experience, logo, requirements);

        // Ensure recruiter is logged in and has the correct role
        const recruiterId = req.user?.recruiterId; // Corrected from recruitreId
        if (!recruiterId) {
            return res.status(401).json({ message: "Unauthorized: Recruiter not logged in." });
        }

        // Create and save the new job
        const newJob = new jobs({
            title,
            description,
            company,
            recruiter: recruiterId,
            location,
            minPrice,
            maxPrice,
            employmenttype,
            experience,
            logo, // Store the file path (string)
            requirements,
        });

        const savedJob = await newJob.save();

        // Update recruiter with the new job post
        await recruiters.findByIdAndUpdate(recruiterId, { $push: { jobsPosted: savedJob._id } });

        res.status(201).json({ alert: "Job added successfully", job: savedJob });
        // res.status(201).json("Job added successfully");

    } catch (error) {
        console.error("Error adding job:", error);
        res.status(500).json({ message: "Failed to add job", error });
    }
};


//get job post - need of authorisation

exports.getJobpost = async (req, res) => {
    console.log("Inside getJobpost");
    const searchKey = req.query.search
    console.log(searchKey);

    const filter = {
        recruiter: req.user.recruiterId, // Ensure recruiterId is passed correctly
        title: { $regex: searchKey, $options: 'i' } // Match jobrole with search key (case-insensitive)
    };
    try {
        // Ensure the recruiter ID is passed correctly from the middleware
        // constrecruiterId req.user.recruiterId; // `recruiterId` should match the token payload
        //console.log("Recruiter ID from JWT:",recruiterId);

        // Find jobs matching the recruiter ID
        // const allJobs = await jobs.find({ recruiter: recruiterId ,query});
        const allJobs = await jobs.find(filter);

        // console.log("Jobs found:", allJobs);

        res.status(200).json(allJobs);
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ message: "Failed to fetch jobs", error: err });
    }
};

//deleteJobpost
exports.deleteJobpostController = async (req, res) => {
    console.log("inside deleteJobpostController");
    const { id } = req.params
    try {
        const deletePost = await jobs.findByIdAndDelete({ _id: id })
        res.status(200).json(deletePost)
    } catch (err) {
        res.status(401).json(err)
    }

}


//viewApplicants

exports.viewApplicantsController = async (req, res) => {
    console.log("inside viewApplicantsController ");
    try {
        const recruiterId = req.user.recruiterId;
        if (!recruiterId) {
            return res.status(401).json({ message: "Unauthorized: Recruiter not logged in." });
        }

        const recruiterJobs = await jobs.find({ recruiter: recruiterId })
            .populate('appliedDetails.jobSeeker', 'name email')
            .select('title appliedDetails');

        // Flatten the data structure
        const flattenedData = recruiterJobs.flatMap((job) =>
            job.appliedDetails.map((applicant) => ({
                jobId: job._id,
                jobTitle: job.title,
                applicantName: applicant.jobSeeker.name,
                applicantEmail: applicant.jobSeeker.email,
                appliedDate: applicant.appliedDate,
                resume: applicant.resume,
            }))
        );

        if (flattenedData.length === 0) {
            return res.status(404).json({ message: "No jobs found for this recruiter." });
        }

        res.status(200).json({
            message: "Applied job seekers fetched successfully.",
            data: flattenedData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while fetching job seekers.", error: err.message });
    }
};

//updateJobDetails

exports.editJobDetailsController = async (req, res) => {
    console.log("inside editJobDetailsController");

    const { id } = req.params; // Directly access the id
    const recruiterId = req.user.recruiterId; 
    const {
        title,
        description,
        company,
        location,
        minPrice,
        maxPrice,
        requirements,
        experience,
        employmenttype
    } = req.body;

    //  use uploaded file if exists, otherwise use existing logo from the body
    const reUploadLogo = req.file ? req.file.filename : req.body.logo;

    try {
        // Correctly use findByIdAndUpdate
        const updatedJobDetails = await jobs.findByIdAndUpdate(
            id, // Pass the ID directly
            {
                title, description,
                company,
                location,
                minPrice,
                maxPrice,
                employmenttype,
                experience,
                logo: reUploadLogo,
                requirements,
                recruiterId
            },
            { new: true } // Return the updated document
        );

        if (!updatedJobDetails) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json(updatedJobDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error updating job details",
            error: err.message
        });
    }
};


//update Recruiter profile
exports.recruiterUpdateController = async (req, res) => {
    console.log("inside recruiterUpdateController");
    const { company, email, password, phone, profilePic } = req.body;
    const recruiterId = req.user.recruiterId;
  
    try {
        // Handle file upload
        const uploadedProfilePic = req.file ? req.file.filename : profilePic;
  
        // Update Recruiter details in the database
        const updatedRecruiter = await recruiters.findByIdAndUpdate(
            { _id: recruiterId },
            {
                company,
                email,
                password,
                phone,
                profilePic: uploadedProfilePic, // Update the profile picture
            },
            { new: true } // Return the updated document
        );
  
        if (!updatedRecruiter) {
            return res.status(404).json({ error: "Recruiter not found" });
        }
  
        res.status(200).json(updatedRecruiter); // Send updated Recruiter details
    } catch (err) {
        console.error("Error updating Recruiter:", err);
        res.status(500).json({ error: "Failed to update Recruiter profile" });
    }
  };