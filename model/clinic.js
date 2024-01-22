const mongoose = require('mongoose')

const clinic = mongoose.Schema({
  name: String,
  description: String,
  typo : String,
  location: {
    latitude: String,
    longitude : String
  },
  image : String,
  about : String 
});
clinic.index({ location: "2dsphere" });
module.exports = mongoose.model('clinics', clinic)