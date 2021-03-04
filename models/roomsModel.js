const mongoose = require("mongoose")
const Schema = mongoose.Schema

const NewRoomSchema = new Schema({
  roomName: { type: String, required: true },
  messages: { type: [] },
  usersOnline: { type: [] },
})

module.exports = mongoose.model("rooms", NewRoomSchema)
