const express = require("express")
const router = express.Router()

const NewRoomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

router.get("/", async (req, res) => {
  let rooms = {}
  let usersOnline
  //Get all online users that are online
  await userModel.find({}, (error, users) => {
    if (error) return handleError(error)

    usersOnline = users.filter((user) => {
      return user.userOnline == true
    })
  })
  console.log(usersOnline)

  //Gets all the rooms from the database
  await NewRoomModel.find({}, "roomName", (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })
  res.render("chatPage.ejs", { rooms, usersOnline })
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
