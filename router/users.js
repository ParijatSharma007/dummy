const mongoose = require('mongoose')
const {Router} = require('express')
const Users = require('../model/users')
const multer = require('multer')
const url = require('../api')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const authCheck = require('../middleware/auth-check')

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, './profilePic/')
    },
    filename : (req, file, cb) => {
        cb(null, new Date().toISOString()+file.originalname)
    }
})

function deleteImage(file_name){
    var file_path =  './profilePic/'+file_name;
    fs.unlink(file_path, (err) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("File deleted");
        }
    })
}


const profilePic = multer({
    storage,
    limits : {
        fileSize : 15 * 1024 * 1024,
    }
})

const router = Router()

router.post("/signup", profilePic.single("profilePic"), (req, res, next) => {
    const userInput = req.body
    console.log("userinput",userInput);
    console.log("userinput", req.file);
    if(!req.file){
        const user = {
            name : userInput.name,
            email : userInput.email,
            password : userInput.password,
            number : userInput.number
        }
        return next(user)
    }
    Users.findOne({email : userInput.email}).then((doc) => {
        if(doc){
            deleteImage(req.file.filename)
            return res.status(422).json({
                field : "email",
                message : "Email already exists",
                success : false
            })
        }
        else{
            bcrypt.hash(userInput.password, 10, (err, hash) => {
            if(err){
                deleteImage(req.file.filename);
                return res.status(500).json({
                  message: "hashing failed",
                  error: err,
                  success: false,
                });
            }
            else{
                const user = new Users({
                    name: userInput.name,
                    email: userInput.email,
                    password: hash,
                    profilePic: req.file.path,
                    number : userInput.number
                });
                user.save().then(() => {
                    return res.status(201).json({
                      message: "Data created",
                      success: true,
                    });
                }).catch((err) => { 
                    deleteImage(req.file.filename);
                    return res.status(500).json({
                      message: err.message,
                      type: err.name,
                      success: false,
                    });
                })
            }
        })
}})})

router.use((user, req, res, next) => {
    Users.findOne({email : user.email}).then(doc => {
        if(doc){
            return res.status(401).json({
              message: "Email is already exists",
              success: false,
              field : "email"
            });
        }
        bcrypt.hash(user.password, 10, (err, hash) => {
            if(err){
                res.status(500).json({
                  message: "Some problem on hashing",
                  error: err,
                  success: false,
                });
            }
            else{
                console.log(user);
                const newUser = new Users({
                    name : user.name,
                    email : user.email,
                    password : hash,
                    number : user.number
                })
                newUser
                  .save()
                  .then(() => [
                    res.status(201).json({
                      message: "Account is created",
                      success: true,
                    }),
                  ])
                  .catch((err) => {
                    return res.status(500).json({
                      _message: "test",
                      message: err.message,
                      type: err.name,
                      success: false,
                    });
                  });
            }
        })
    })
})

router.post("/login", (req, res, next) => {
    Users.findOne({ email: req.body.email }).then((doc) => {
      console.log(doc);
      if (!doc) {
        return res.status(401).json({
          message: "Email doesn't exist",
          success: false,
          field : "email"
        });
      }
      bcrypt.compare(req.body.password, doc.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              id: doc._id,
              name: doc.name,
              email: doc.email,
              profilePic: url.baseUrl + doc.profilePic,
            },
            "TbCJs3GSkaM4uYVev1I0orL8EjKFtmgQ",
            {
              expiresIn: "10h",
            }
          );

          return res.status(200).json({
            message: "Login successful",
            token,
            success: true,
          });
        } else {
          return res.status(401).json({
            field : "password",
            message: "Wrong Password",
            success: false
          });
        }
      });
    });
})

router.get('/profile-details', authCheck, (profile, req, res, next) => {
    return res.status(200).json({
      success : true,
      data : {
        name : profile.name,
        email : profile.email,
        number : profile.number,
        avatar : profile.profilePic
    }})
})

// router.get("/:userId", (req, res, next) => {
//     const userId = req.params.userId
//     Users.findById(userId).then(
//         (doc) => {
//             if(!doc){
//                 return res.status(404).json({
//                 message : "User don't exist"
//                 })
//             }
//             res.status(200).json({
//             data: {
//                 name: doc.name,
//                 email: doc.email,
//                 password: doc.password,
//                 profilePic: doc.profilePic,
//                 requestProfilePic: {
//                     method: "GET",
//                     profilePicUrl: url.baseUrl + doc.profilePic,
//                     },
//                 },
//                 });
//             }
//     ).catch((err) => {
//         return res.status(500).json({
//             message : "something went wrong",
//             err
//         })
//     })
// })


// router.get("/view-users", (req, res, next) => {
//     Users.find().select("_id name email profilePic").then((docs) => {
//         console.log(docs);
//         res.status(200).json(
//            {
//             dataLength : docs.length,
//             data : docs.map(element => {
//                 return {
//                     name : element.name,
//                     email : element.email,
//                     profilePic : element.profilePic,
//                     request : {
//                         method : "GET",
//                         url : url.baseUrl + "users/" + element._id 
//                     }
//                 }
//             })
//         })
//     })
// })

module.exports = router