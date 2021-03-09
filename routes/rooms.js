const express = require("express")
const router = express.Router()

const roomModel = require("../models/roomsModel")

router.use(express.urlencoded({ extended: true }))


//TABORT "/" FÖR ORGINAL
router.get("/", (req, res) => {
  roomModel.find({}, "roomName", (error, rooms) => {
    if (error) return handleError(error)
    res.render("chatPage.ejs", { rooms })
  })
})

router.get("/:room", async (req, res) => {
  let rooms = []
  let room = {}
  await roomModel.find({}, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  await roomModel.findOne({ roomName: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  res.render("room.ejs", { rooms, room })
})

let images = []
router.post("/:room", (req, res) => {
  try {
    if (req.files) {
      let fileUpload = req.files.fileUpload //Namnet på inputfältet profile_pic
      let file_name = `./uploads/${req.params.room}/${fileUpload.name}`
      fileUpload.mv(file_name) //Flyttar in filen i våran mapp
      images.push(file_name)
      res.render("room", { images, rooms, room })
    } else {
      res.end("<h1>No file uploaded</h1>")
    }
  } catch (error) {}
})

module.exports = router
