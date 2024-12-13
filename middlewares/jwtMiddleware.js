// const jwt = require('jsonwebtoken')



// const jwtMiddleware = (req,res,next)=>{
//     console.log("Inside jwtMiddleware");
//     const token = req.headers["authorization"].split(" ")[1]
//     console.log(token);
//     if(token){
//        const jwtResponse=  jwt.verify(token,process.env.JWTPASSWORD)
//        console.log(jwtResponse);
//     //    req.
//         // next()
//     }else{
//         res.status(404).json("Authorisation failed..Token is missing")
//     }
//    }

// module.exports = jwtMiddleware

// const jwt = require('jsonwebtoken');
// const recruiters = require('../models/recruiterModel');
// const jobSeekers = require('../models/jobseekerModel');

// module.exports = async (req, res, next) => {
//     console.log("Iniside jwtmiddleware");
    
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: Token is missing." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWTPASSWORD);

//     // Assign decoded data to req.user
//     req.user = decoded;

//     // Check role
//     if (decoded.role === 'recruiter') {
//       const recruiter = await recruiters.findById(decoded.recruitreId);
//       if (!recruiter) {
//         return res.status(403).json({ message: "Unauthorized: Recruiter not found." });
//       }
//     } else if (decoded.role === 'jobseeker') {
//       const jobSeeker = await jobSeekers.findById(decoded.jobseekerId);
//       if (!jobSeeker) {
//         return res.status(403).json({ message: "Unauthorized: Job seeker not found." });
//       }
//     }

//     next();
//   } catch (error) {
//     console.error("JWT Error:", error);
//     return res.status(403).json({ message: "Invalid token." });
//   }
// };


const jwt = require('jsonwebtoken');
const recruiters = require('../models/recruiterModel');
const jobSeekers = require('../models/jobseekerModel');

const jwtMiddleware = (role) => {
  return async (req, res, next) => {
    console.log("Inside jwtMiddleware");
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token);
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token is missing." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWTPASSWORD);
      console.log("Decoded JWT Payload:", decoded); // Log the entire decoded payload
      // Assign decoded data to req.user
      req.user = decoded;

      // Role-specific validation
      if (role === 'recruiter') {
        const recruiter = await recruiters.findById(decoded.recruiterId);
        console.log("Recruiter ID:", decoded.recruitreId);
        console.log("Recruiter Data:", recruiter);
        if (!recruiter) {
            return res.status(403).json({ message: "Unauthorized: Recruiter not found." });
        }
    } else if (role === 'jobseeker') {
        const jobSeeker = await jobSeekers.findById(decoded.jobseekerId);
        console.log("Jobseeker ID:", decoded.jobseekerId);
        console.log("Jobseeker Data:", jobSeeker);
        if (!jobSeeker) {
            return res.status(403).json({ message: "Unauthorized: Job seeker not found." });
        }
    }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("JWT Decoding Error:", error.message);    
          return res.status(403).json({ message: "Invalid token." });
    }
  };
};

module.exports = jwtMiddleware;
