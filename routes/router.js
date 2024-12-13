const express = require('express')
const recruiterContoller = require('../controllers/recruiterController')
const jobseekerController =  require('../controllers/jobseekerController')
const router = new express.Router()
const adminController = require('../controllers/adminController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const multerMiddleware = require("../middlewares/multerMiddleware")
//admin
router.post('/admin-login',adminController.adminLoginController);
router.get('/view-total-users',adminController.viewStatsController);
router.post('/add-faq',adminController.addFaqController);
router.get('/view-faq',adminController.getAddedFaqController);
router.get('/home',adminController.getAddedFaqController);
router.delete('/admin-dashboard/:id/delete-faq',adminController.deleteFaqController);
router.put('/admin-dashboard/:id/update-faq',adminController.updateFaq);

//company

//recruiter-register :http://localhost:3000/recruiter-register
router.post('/recruiter-register',recruiterContoller.recruiterRegisterContoller)
//recruiter-login :http://localhost:3000/recruiter-login
router.post('/recruiter-login',recruiterContoller.recruiterLoginController)
//addJOb:http://localhost:3000/add-job
// router.post('/add-job',jwtMiddleware,recruiterContoller.addJobController)
router.post('/add-job', jwtMiddleware('recruiter'),multerMiddleware.single('logo'),recruiterContoller.addJobController);
// router.post('/add-job',jwtMiddleware,recruiterContoller.addJobController)
router.get('/get-jobpost', jwtMiddleware('recruiter'),recruiterContoller.getJobpost);
//Companymanage
router.get('/companymanage', jwtMiddleware('recruiter'),recruiterContoller.getJobpost);
//delete-jobpost
router.delete('/companymanage/:id/remove', jwtMiddleware('recruiter'),recruiterContoller.deleteJobpostController);
//view-applicants
router.get('/view-applicants', jwtMiddleware('recruiter'),recruiterContoller.viewApplicantsController);
//update-JobDetails
router.put('/editjobpost/:id/edit', jwtMiddleware('recruiter'),multerMiddleware.single('logo'),recruiterContoller.editJobDetailsController);
//http://localhost:3000/edit-recruiter
router.put('/edit-recruiter',jwtMiddleware('recruiter'),multerMiddleware.single('profilePic'),recruiterContoller.recruiterUpdateController);


//jobseeker


//jobseeker-register :http://localhost:3000/jobseeker-register
router.post('/jobseeker-register',jobseekerController.jobseekerRegisterController)

//jobseeker-login :http://localhost:3000/jobseeker-login
router.post('/jobseeker-login',jobseekerController.jobseekerLoginController)
//getalljobpost
router.get('/get-all-jobpost', jwtMiddleware('jobseeker'),jobseekerController.getAllJobPost);
//view-single-jobpost
router.get('/viewjobdetails/:id/viewsingle', jwtMiddleware('jobseeker'),jobseekerController.viewSingleJobController);
//upload-resume
router.post('/upload-resume', jwtMiddleware('jobseeker'),multerMiddleware.single('resume'),jobseekerController.uploadResumeController);
//filter jobs
router.get('/filter-jobs',jwtMiddleware('jobseeker'), jobseekerController.filterJobController);
//http://localhost:3000/edit-jobseeker
router.put('/edit-jobseeker',jwtMiddleware('jobseeker'),multerMiddleware.single('profilePic'),jobseekerController.jobseekerUpdateController);

module.exports = router