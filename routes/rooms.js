const express = require("express")
const router = express.Router()

const roomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

///////HÄmtar alla Users som är online//////////
let usersOnline
let usersOnlineTest = async function () {
  await userModel.find({}, (error, users) => {
    if (error) return handleError(error)

    usersOnline = users.filter((user) => {
      return user.userOnline == true
    })
  })
}
usersOnlineTest()
/////////////////////

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
  let images = []
  let room = {}

  //let usersOnline

  //let rooms = []
  await roomModel.find({ private: false }, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  await roomModel.findOne({ roomName: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
    console.log(room)
  })

  res.render("room.ejs", {
    images,
    rooms,
    room,
    usersOnline,
    logedInUser: req.user.userName,
  })
})

// NOTE BILD UPPLADDNING // Fixa så att det går att se alla bilder som skickas och inte bara den senaste
router.post("/:room", async (req, res) => {
  //let room = req.params.room
  // let images = []
  // console.log(images, "images")
  let room = {}

  await roomModel.findOne({ roomName: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  try {
    if (req.files) {
      let fileUpload = req.files.fileUpload //Namnet på inputfältet
      let file_name = `/uploads/${fileUpload.name}`

      await fileUpload.mv("." + file_name) //Flyttar in filen i våran mapp

      res.render("room", { images: [file_name], rooms, room, usersOnline })
    } else {
      res.end("<h1>No file uploaded</h1>")
    }
  } catch (error) {}

  res.end()
})

module.exports = router
