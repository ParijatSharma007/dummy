const mongoose = require("mongoose");

const feedback = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  feedback: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model("feedback", feedback);
