import User, { loginValidate, userValidate } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
import { Error } from 'mongoose';

import path from 'path';
import { fileURLToPath } from 'url';
import { render } from 'ejs';
import { token } from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getAll(req, res) {
    try {
        const users = await User
            .find({}).lean();
        console.log(users);
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function profile(req, res) {
    try {
        const { _id } = req.user;
        const connectedUser = await User.findById(_id).lean();
        res.status(200).json(connectedUser);
    } catch (err) {
        res.status(401).json({ "message": "authentication problem" })
    }

}

export async function register(req, res) {
    const { error } = userValidate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email })

    if (user) {
        return res.status(404).send('Email already exists')
    }
    var jwt = require("jsonwebtoken");
    var bcrypt = require("bcryptjs");
    const token = jwt.sign({email: req.body.email}, config.secret)
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const { username, email } = req.body
    await User
        .create({
            username,
            email,
            password: hashedPassword,
            role: "user",
            otpCode: Math.floor(1000 + Math.random() * 9000),
            confirmCode:  Math.floor(1000 + Math.random() * 9000)
        })
        .then(docs => {
            res.status(200).json({ message: 'User was registred  Successfully! please check your email', docs });
        })
        .catch(err => { 
            res.status(500).json({ error: err });
        });
    await sendRegistrationMail(email);
}



export async function sendRegistrationMail(email) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "ala.gharbi@esprit.tn",
            pass: "espritPWD-7"
        },
    });
    transporter.sendMail({
        from: "ala.gharbi@esprit.tn",
        to: email,
        subject: "welcome",
        text: "welcome to our application",
    });
}
function sendEmail(user){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amir.maalaoui27@gmail.com',
        pass: 'xbrwuldvynvidhdy'
      }
    });

    var mailOptions = {
      from: 'amir.maalaoui27@gmail.com',
      to: user,
      subject: 'Sending Email using Node.js',
      text: codeV
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error+'test');
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}
// export function send_email(req, res){  
//     User.findOne({email : req.body.email })
//     .then(user =>{
//       if(user){
//         const use = req.body.email
//         sendEmail(use);
//         store('Code', {code:codeV,email:req.body.email}); 
//         res.status(500).json({
//           message : 'Verification code is sent to your email'
//         })
//       }else{
//         res.status(500).json({
//           message : 'User not found'
//         })
//       }
//     }).catch(err=>{
//       res.status(200).json({
//         message : err
//       })
//     })
//   }


export async function login(req, res) {
    const { error } = loginValidate(req.body);
    
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).send('Invalid email or password')
    }
    const checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) {
        return res.status(404).send('Invalid email or password');
    }
   /*else if (user.status != "Active") {
        return res.status(401).send({
          message: "Pending Account. Please Verify Your Email!",
        });
      }*/
    else{await verifyMail(email,confirmCode); } 
      
      
   
    const token = jwt.sign({ _id: user._id }, 'privateKey')
    res.header('x-auth-token', token).status(200).send({ token: token, user: user });

}
//Recherche d’un seul document
export async function getOnce(req, res) {

    await User
        .findById(req.params.id)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

export async function patchOnce(req, res) {

    await User
        //findByIdAndUpdate si vous voulez modifier un document à l’aide de son ID.
        .findByIdAndUpdate(req.params.id, req.body)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });

}

export async function deleteOnce(req, res) {
    try {
        let checkIfUserExists = await User.findById(req.params.id);
        if (!checkIfUserExists) throw new Error();
        const user = await User
            .findByIdAndRemove(req.params.id)
        res.status(200).json({ "message": user });
    } catch (err) {
        res.status(404).json({ message: "user not found" });
    }

}

export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const renderedUser = await User.findOne({ email });
        if (!renderedUser) {
            throw new Error("user not found");
        }
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "ala.gharbi@esprit.tn",
                pass: "espritPWD-7"
            },
        });
        transporter.sendMail({
            from: "ala.gharbi@esprit.tn",
            to: email,
            subject: "forget password",
            text: `here your reset password code ${renderedUser.otpCode}`,
        });
        res.status(200).json({ code: renderedUser.otpCode });

    } catch (err) {
        res.json(404).json({ message: err.message })
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { code, newPassword, email } = req.body;
        const renderedUser = await User.findOne({ email });
        if (!renderedUser) {
            throw new Error("wrong email");
        }
        if (renderedUser.otpCode != code) {
            throw new Error("wrong code");
        }

        const updatedUser = await User.findOneAndUpdate({ _id: renderedUser._id || renderedUser.id }, {
            $set: {
                password: await bcrypt.hash(newPassword, 10),
                otpCode: Math.floor(1000 + Math.random() * 9000),
            }
        }
            , { returnOriginal: false });
        res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
}
   






export async function verifyMail(email,confirmCode) {
  try {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "",
            pass: ""
        },
    });
    transporter.sendMail({
        from: "ala.gharbi@esprit.tn",
        to: email,
        subject: "confirm email",
        text: `here your reset password code ${confirmCode}`,
    });
    res.status(200).json({ confirmCode });

} catch (err) {
    res.json(404).json({ message: err.message })
}
};

export const changePasswordInProfile = async (req, res, next) => {
    try {
        const {id} = req.params;
        const { password, newPassword } = req.body;
        const renderedUser = await User.findOne({ _id: id });
        if (!renderedUser) {
            throw new Error("wrong email");
        }
        const checkIfPasswordIsOkay = await bcrypt.compare(password, renderedUser.password);
        if (!checkIfPasswordIsOkay) {
            throw new Error("wrong password");
        }

        const updatedUser = await User.findOneAndUpdate({ _id: renderedUser._id || renderedUser.id }, {
            $set: {
                password: await bcrypt.hash(newPassword, 10),
            }
        }
            , { returnOriginal: false });
        res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
 


  
}
import store from 'store2' ; 


// geberate random code 
const generateCode = ()=>{
    let code = Math.floor(Math.random() * 100000);
    return code.toString() ; 
  }

  var codeV = generateCode();
export async function sendMail(req, res) {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,          
            secure: true,
            auth: {
                user: "amir.maalaoui27@gmail.com",
                pass: "xbrwuldvynvidhdy"
            },
        });
        let info = transporter.sendMail({
            from: "Amir Maalaoui",
            to: req.body.email,
            subject: "Message",
            text: codeV,
        });
        res.json(info);
        store('Code', {code:codeV,email:req.body.email}); 
    } catch (err) {
        res.status(500).json({ message: err.message6});
    }

}



export async function verify_code(req, res){
   
    // User.findOne({email : req.body.email })
    const code  = (store.getAll().Code.code)
    if((req.body.code)== code){  
      res.status(200).json({
        message : 'The same code now you can change your password'
      })
    }else{
      res.status(500).json({
        message : 'Verify your verification code '
      })
    }
  
}
export async function change_pass(req, res){
    User.findOne({email :store.getAll().Code.email })
    .then(user=>{
        if(user!=null){
           User.updateOne({email:user.email},{
            $set : {
                password : req.body.newpass
            }
           })
           .then(up=>{
            if(up){
                res.send('Changed with success')
            }else{
                res.send('Password does not chnaged')
            }
           })
        }else{
            res.status(404).json({
                message : 'User does not exist'
            })
        }
    }).catch(err=>{
        console.log(err)
    })
}