const express = require("express")
const router = express.Router()

const roomModel = require("../models/roomsModel")

router.use(express.urlencoded({ extended: true }))
let rooms = []
//TABORT "/" FÖR ORGINAL
router.get("/", (req, res) => {
  // console.log("/")
  // roomModel.find({}, "roomName", (error, rooms) => {
  //   if (error) return handleError(error)
  //res.render("chatPage.ejs", { rooms })
  res.redirect("/chatPage")
  // })
})

router.get("/:room", async (req, res) => {
  //let rooms = []
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

//BILD UPPLADDNING
router.post("/:room", async (req, res) => {
  let room = req.params.room

  // let room = {}

  // await roomModel.findOne({ roomName: req.params.room }, (error, data) => {
  //   if (error) return handleError(error)
  //   room = data
  // })

  let images = []
  try {
    if (req.files) {
      let fileUpload = req.files.fileUpload //Namnet på inputfältet
      let file_name = `./uploads/${fileUpload.name}`
      await fileUpload.mv(file_name) //Flyttar in filen i våran mapp
      images.push(file_name)

      res.render("room.ejs", { images, room, rooms })
    } else {
      res.end("<h1>No file uploaded</h1>")
    }
  } catch (error) {}

  res.end()
})

module.exports = router
