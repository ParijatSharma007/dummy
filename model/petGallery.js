const mongoose = require('mongoose')

const petGallery = mongoose.Schema({
    breed : String,
    price : Number,
    about : String,
    description : String,
    left : Number,
    negotiable : Boolean,
    phone : String,
    dob : String,
    age : Number,
    maintenance : String,
    temperament : String,
    image : [
        {
            type : String
        }
    ]
})

module.exports = mongoose.model('Dogs', petGallery)