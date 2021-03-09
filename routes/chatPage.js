const express = require("express")
const router = express.Router()

const NewRoomModel = require("../models/roomsModel")

router.use(express.urlencoded({ extended: true }))

router.get("/", (req, res) => {
  //Gets all the rooms from the database
  NewRoomModel.find({}, "roomName", (error, rooms) => {
    if (error) return handleError(error)
    res.render("chatPage.ejs", { rooms })
  })
})

//Creating the new room
router.post("/", (req, res) => {
  const newRoom = new NewRoomModel({
    roomName: req.body.newRoomName,
    messages: [],
    userOnline: [],
  })
  newRoom.save((err) => {
    if (err) {
      return console.log("error creating new room")
    }
    res.redirect("/chatPage")
  })
})

// router.get("/:room", (req, res) => {
//   NewRoomModel.find({}, "roomName", (error, rooms) => {
//     if (error) return handleError(error)
//     let room = req.params.room
//     res.render("room.ejs", { rooms, room: room })
//   })

//   //console.log(req.params.room)
//   // res.render("room.ejs", { room: req.params.room, rooms: rooms })
// })

module.exports = router
