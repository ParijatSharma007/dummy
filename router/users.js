const mongoose = require('mongoose')
const {Router} = require('express')
const Users = require('../model/users')
const multer = require('multer')
const url = require('../api')
const bcrypt = require('bcrypt')
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

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png'){
        return cb(null, true)
    }
    else{
        return cb(null, false)
    }
}

const profilePic = multer({
    storage,
    limits : {
        fileSize : 5 * 1024 * 1024,
        fileFilter
    }
})

const router = Router()

router.post("/signup", profilePic.single("profilePic"), (req, res, next) => {
    const userInput = req.body
    if(!req.file){
        const user = {
            name : userInput.name,
            email : userInput.email,
            password : userInput.password
        }
        return next(user)
    }
    Users.findOne({email : userInput.email}).then((doc) => {
        if(doc){
            deleteImage(req.file.filename)
            return res.status(422).json({
                type : "email",
                message : "Email already exists"
            })
        }
        else{
            bcrypt.hash(userInput.password, 10, (err, hash) => {
            if(err){
                deleteImage(req.file.filename);
                return res.status(500).json({
                    message : "hashing failed",
                    error : err
                })
            }
            else{
                const user = new Users({
                    name: userInput.name,
                    email: userInput.email,
                    password: hash,
                    profilePic: req.file.path,
                });
                user.save().then(() => {
                    return res.status(201).json({
                        message : "Data created"
                    })
                }).catch((err) => { 
                    deleteImage(req.file.filename);
                    return res.status(500).json({
                        message : err.message,
                        type : err.name
                    });
                })
            }
        })
}})})

router.use((user, req, res, next) => {
    Users.findOne({email : user.email}).then(doc => {
        if(doc){
            return res.status(401).json({
                message : "Email is already exists"
            })
        }
        bcrypt.hash(user.password, 10, (err, hash) => {
            if(err){
                res.status(500).json({
                    message : "Some problem on hashing",
                    error : err
                })
            }
            else{
                console.log(user);
                const newUser = new Users({
                    name : user.name,
                    email : user.email,
                    password : hash
                })
                newUser
                  .save()
                  .then(() => [
                    res.status(201).json({
                      message: "Account is created",
                    }),
                  ])
                  .catch((err) => {
                    return res.status(500).json({
                      _message : "test",
                      message: err.message,
                      type: err.name,
                    });
                  });
            }
        })
    })
})

router.post("/login", (req, res, next) => {
    Users.findOne({email : req.body.email}).then((doc) => {
        if(!doc){
            return res.status(401).json({
                message : "Auth Failed"
            })
        }
        bcrypt.compare(req.body.password, doc.password, (err, result) => {
            if(result){
                const token = jwt.sign(
                  {
                    id : doc._id,
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
                    message : "Login successful",
                    token
                })
            }
            else{
                return res.status(401).json({
                  message: "Auth Failed",
                });
            }
        })
    })
})

router.get('/profile-details', authCheck, (profile, req, res, next) => {
    res.status(200).json({data : profile})
})

router.get("/:userId", (req, res, next) => {
    const userId = req.params.userId
    Users.findById(userId).then(
        (doc) => {
            if(!doc){
                return res.status(404).json({
                message : "User don't exist"
                })
            }
            res.status(200).json({
            data: {
                name: doc.name,
                email: doc.email,
                password: doc.password,
                profilePic: doc.profilePic,
                requestProfilePic: {
                    method: "GET",
                    profilePicUrl: url.baseUrl + doc.profilePic,
                    },
                },
                });
            }
    ).catch((err) => {
        return res.status(500).json({
            message : "something went wrong",
            err
        })
    })
})


router.get("/view-users", (req, res, next) => {
    Users.find().select("_id name email profilePic").then((docs) => {
        console.log(docs);
        res.status(200).json(
           {
            dataLength : docs.length,
            data : docs.map(element => {
                return {
                    name : element.name,
                    email : element.email,
                    profilePic : element.profilePic,
                    request : {
                        method : "GET",
                        url : url.baseUrl + "users/" + element._id 
                    }
                }
            })
        })
    })
})

module.exports = router