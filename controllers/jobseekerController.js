const jobSeekers = require('../models/jobseekerModel')
const bycrpt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jobs = require('../models/jobModel')
//jobSeekers registration
exports.jobseekerRegisterController = async(req,res) =>{
    console.log(" inside jobseekerRegisterController");
    // res.status(200).json("Reguster request recevied")
    const {name,email,password} = req.body
    console.log(name,email,password);
    
    try{
        const existingJobseekr = await jobSeekers.findOne({email})
        if(existingJobseekr){
            res.status(406).json("Already Registered..Please Login!!")
        }
        else{
            const saltRounds = 10
            const hashedPassword = await bycrpt.hash(password,saltRounds)
            console.log(`Hashed Password: ${hashedPassword}`);

            const newJobseeker = new jobSeekers({
                name,email,password:hashedPassword,phone:"",resume:"",profilePic:"",appliedJobs:[]
            })
            await newJobseeker.save()
            res.status(200).json(newJobseeker)
        }
    }catch(err){
        res.status(401).json(err)
        console.log(err);
        
    }
}


//jobSeekers login

exports.jobseekerLoginController = async(req,res)=>{
    console.log("inside jobseekerLoginController");
    const {email,password} = req.body
    console.log(email,password);
    try{
    const existingJobseekr = await jobSeekers.findOne({email})
    if(existingJobseekr){
        console.log("Stored user details:", existingJobseekr);
        const decryptPassword = await bycrpt.compare(password,existingJobseekr.password)
        console.log("Password match:", decryptPassword);
        if(decryptPassword){
            //token generation
            const token = jwt.sign({jobseekerId:existingJobseekr._id,role:"jobseeker"},process.env.JWTPASSWORD)
            res.status(200).json({jobSeeker:existingJobseekr,token})
        }
        else {
            res.status(404).json("Incorrect Password.");
        }
    }
    else {
        res.status(404).json("Incorrect email");
    }
    }catch(err){
        res.status(401).json(err)
        console.log(err);
        
    }
    
}

//profile updation

exports.jobseekerUpdateController = async (req, res) => {
  console.log("jobseekerUpdateController");
  const { name, email, password, phone, profilePic } = req.body;
  const jobseekerId = req.user.jobseekerId;

  try {
      // Handle file upload
      const uploadedProfilePic = req.file ? req.file.filename : profilePic;

      // Update jobseeker details in the database
      const updatedJobseeker = await jobSeekers.findByIdAndUpdate(
          { _id: jobseekerId },
          {
              name,
              email,
              password,
              phone,
              profilePic: uploadedProfilePic, // Update the profile picture
          },
          { new: true } // Return the updated document
      );

      if (!updatedJobseeker) {
          return res.status(404).json({ error: "Jobseeker not found" });
      }

      res.status(200).json(updatedJobseeker); // Send updated jobseeker details
  } catch (err) {
      console.error("Error updating jobseeker:", err);
      res.status(500).json({ error: "Failed to update jobseeker profile" });
  }
};


//getalljobpost
exports.getAllJobPost =async (req,res)=>{
    // console.log("Inside getAllJobPost ");
     const searchKey = req.query.search
     const location = req.query.location ; // Get location from query parameters, default to empty string
     
    console.log(searchKey);
      
      // Create a filter for both searchKey (job title) and location if provided
    const filter = {};
    if (searchKey) {
        filter.title = { $regex: searchKey, $options: 'i' }; // Match job title case-insensitively with searchKey
    }
    if (location) {
        filter.location = { $regex: location, $options: 'i' }; // Match location case-insensitively with location
    }
    
    try{
        const allJobs = await jobs.find(filter);
        res.status(200).json(allJobs);

    }
    catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ message: "Failed to fetch jobs", error: err });
    }
}


//filter-job
exports.filterJobController = async(req,res)=>{
  console.log("inside filterJobController");
  const employement = req.query.employmenttype
     const experienceKey = req.query.experience
     console.log(employement);

     const filter = {};
     if (employement) {
      filter.employmenttype = { $regex: employement, $options: 'i' }; // Match location case-insensitively with location
    }
  
    if (experienceKey) {
      filter.experience = { $regex: experienceKey, $options: 'i' }; // Match location case-insensitively with location
    }
    try{
      const filteredJobs = await jobs.find(filter);
      res.status(200).json(filteredJobs);

  }
  catch (err) {
      console.error("Error fetching jobs:", err);
      res.status(500).json({ message: "Failed to fetch jobs", error: err });
  }
}
//viewsinglejobdetails
exports.viewSingleJobController = async(req,res)=>{
    console.log("viewSingleJobController");
    const {id} = req.params
    try{
        const viewSinglePost = await jobs.findById({_id:id})
        res.status(200).json(viewSinglePost)

    }
    catch(err){
        res.status(401).json(err)

    }
    
}





//upload resume
exports.uploadResumeController = async (req, res) => {
    console.log("uploadResumeController triggered");
  
    try {
      const { jobId } = req.body; // Extract Job ID from the request body
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required." });
      }
  
      const resume = req.file?.filename; // Get the uploaded resume filename
      if (!resume) {
        return res.status(400).json({ message: "No resume file uploaded." });
      }
  
      const jobseekerId = req.user?.jobseekerId; // Authenticated jobseeker ID
      if (!jobseekerId) {
        return res.status(401).json({ message: "Unauthorized: Jobseeker not logged in." });
      }
  
      const job = await jobs.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found." });
      }
  
      const alreadyApplied = job.appliedDetails.some(
        (application) => application.jobSeeker.toString() === jobseekerId
      );
  
      if (alreadyApplied) {
        return res.status(409).json({ message: "You have aljready applied for this job." }); // 409 Conflict
      }
  
      // Add the application details to the job's `appliedDetails` field
      const application = {
        jobSeeker: jobseekerId,
        email: req.user.email,
        resume: resume,
        appliedDate: new Date(),
      };
  
      job.appliedDetails.push(application);
      await job.save();
  
      // Add the job to the jobseeker's `appliedJobs` field
      const jobseeker = await jobSeekers.findById(jobseekerId);
      jobseeker.appliedJobs.push(jobId);
      await jobseeker.save();
  
      res.status(200).json({
        message: "Resume uploaded and application submitted successfully.",
        data: {
          jobId,
          jobseekerId,
          resume,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred while processing your application.", error: err.message });
    }
  };
  
// // Filter jobs based on query parameters
// exports.filterJobsController = async (req, res) => {
//   try {
//       const { location, jobType, jobRole } = req.query;

//       const filter = {};
//       if (location && location !== 'All') filter.location = location;
//       if (jobType && jobType !== 'All') filter.employmenttype = jobType;
//       if (jobRole && jobRole !== 'All') filter.title = jobRole;

//       const jobs = await jobs.find(filter);
//       res.status(200).json(jobs);
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal Server Error' });
//   }
// };