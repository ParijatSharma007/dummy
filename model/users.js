const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: [true, "Email is required"] ,
    validate : {
      validator : (value) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value),
      message : (props) => `${props.value} isn't an email`
    }
  },
  number : {type : String, required : true},
  password: { type: String, required: true },
  profilePic : String,
});

module.exports = mongoose.model('users', userSchema)