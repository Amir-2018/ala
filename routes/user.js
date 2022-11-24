import express from 'express';
import {change_pass,verify_code, register, deleteOnce, getAll, getOnce, patchOnce, login, profile, sendMail, sendRegistrationMail, forgetPassword, changePassword, changePasswordInProfile } from '../controllers/user.js';
//import sendRegistrationMail from '../controllers/user.js'
import { checkToken } from '../middlewares/auth.js';

const router = express.Router();


router
    .route('/')
    .get(checkToken, getAll)
    .post(register);
     
router.post('/mail',sendMail)
router.post("/verify_code", verify_code); 
router.post("/change_pass", change_pass); 

    router
    .route('/register')
    .post(sendRegistrationMail);

  
    
    
    router
    .post("/forgetPassword", forgetPassword);

router
    .route('/:id')
    .patch(checkToken, patchOnce)
    .delete(checkToken, deleteOnce);
router.get("/profile", checkToken, profile)
router.post("/login", login);
router.post("/changePassword", changePassword);

router.post("/changePasswordProfile/:id", changePasswordInProfile);
export default router;