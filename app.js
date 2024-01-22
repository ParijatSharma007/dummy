const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const morgan = require('morgan');
const users = require('./router/users');
const clinic = require('./router/clinic')
const feedback = require('./router/feedback')
const pet = require('./router/petGallery')


const db =
  "mongodb+srv://admin_user_001:Parijat007.@cluster0.tvqhwwf.mongodb.net/?retryWrites=true&w=majority";

const app = express()

app.use(morgan("dev"))
app.use(cors({
    origin : "*"
}))
app.use(express.urlencoded({
    extended : false
}))

app.use(express.json())

mongoose.Promise = global.Promise;
mongoose.connect(db)

app.use('/users', users)
app.use('/clinic', clinic)
app.use("/feedback", feedback);
app.use("/pet", pet)

app.use('/profilePic', express.static('profilePic'))
app.use("/dummy", express.static("dummy"));

app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message,
  });
});

module.exports = app