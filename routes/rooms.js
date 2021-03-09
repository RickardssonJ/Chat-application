const express = require("express")
const router = express.Router()

const NewRoomModel = require("../models/roomsModel")

router.use(express.urlencoded({ extended: true }))

router.get("/:room", async (req, res) => {
  // NewRoomModel.find({}, "roomName", (error, rooms) => {
  //   if (error) return handleError(error)
  //   res.render("room.ejs", { rooms, room: req.params.room })
  // })

  // NewRoomModel.find({}, (error, rooms) => {
  //   console.log(rooms)
  //   if (error) return handleError(error)
  //   res.render("room.ejs", { rooms, room: req.params.room })
  // })
  // })

  //FUNGRAR FÖR ATT FÅ FRAM ENDAST ETT RUM
  // NewRoomModel.findOne({ roomName: req.params.room }, (error, thisRoom) => {
  //   console.log(thisRoom)
  //   if (error) return handleError(error)
  //   res.render("room.ejs", { thisRoom })
  // })

  let rooms = []
  let room = {}
  await NewRoomModel.find({}, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  await NewRoomModel.findOne({ roomName: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  res.render("room.ejs", { rooms, room })
})

module.exports = router
