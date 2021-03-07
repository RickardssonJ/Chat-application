const express = require("express")
const router = express.Router()

const NewRoomModel = require("../models/roomsModel")

router.use(express.urlencoded({ extended: true }))

router.get("/:room", (req, res) => {
  NewRoomModel.find({}, "roomName", (error, rooms) => {
    if (error) return handleError(error)
    res.render("room.ejs", { rooms, room: req.params.room })
  })

  //console.log(req.params.room)
  // res.render("room.ejs", { room: req.params.room, rooms: rooms })
})

module.exports = router
