const mongoose = require("mongoose")
const Schema = mongoose.Schema

const NewUserSchema = new Schema({
  userName: { type: String, required: true },
  userMail: { type: String, required: true },
  userPassword: { type: String, required: true },
})

module.exports = mongoose.model("users", NewUserSchema) //NewUser är vad den kommer att heta i databasen
