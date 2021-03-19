const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../confiq/auth")

const roomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

function handleError(error) {
  console.log(error)
}

///////HÄmtar alla Users som är online//////////
//NOTE Byt namn på userOnlineTest
// let usersOnline
// let getOnlineUsers = async function () {
//   await userModel.find({}, (error, users) => {
//     if (error) return handleError(error)

//     usersOnline = users.filter((user) => {
//       return user.userOnline == true
//     })
//   })
// }
// getOnlineUsers()
/////////////////////

let rooms = []
let room = {}

router.get("/", ensureAuthenticated, (req, res) => {
  res.redirect("/chatPage")
})

router.get("/:room", ensureAuthenticated, async (req, res) => {
  let images = []
  let userDoc = req.user
  //let room = {}

  //NOTE varför heter funktionerna samma namn
  let getOfflineUsers = async function () {
    await userModel.find({}, (error, users) => {
      if (error) return handleError(error)

      usersOffline = users.filter((user) => {
        return user.userOnline == false
      })
    })
  }
  getOfflineUsers()
  let getOnlineUsers = async function () {
    await userModel.find({}, (error, users) => {
      if (error) return handleError(error)

      usersOnline = users.filter((user) => {
        return user.userOnline == true
      })
    })
  }
  getOnlineUsers()

  //let rooms = []
  await roomModel.find({ private: false }, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  await roomModel.findOne({ _id: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  res.render("room", {
    images,
    rooms,
    room,
    usersOnline,
    logedInUser: req.user.userName,
    usersOffline,
    userDoc,
  })
})

// NOTE BILD UPPLADDNING // Fixa så att det går att se alla bilder som skickas och inte bara den senaste
router.post("/:room", ensureAuthenticated, async (req, res) => {
  //let room = req.params.room

  // console.log(images, "images")
  let room = {}
  let logedInUser = req.user.userName

  await roomModel.findOne({ roomName: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  try {
    if (req.files) {
      let fileUpload = req.files.fileUpload //Namnet på inputfältet
      //let file_name = `/uploads/${fileUpload.name}`
      let file_name = `/uploads/${logedInUser}_profilPic.jpg`

      await fileUpload.mv(`.${file_name}`) //Flyttar in filen i våran mapp

      res.render("room", {
        images: file_name,
        rooms,
        room,
        usersOnline,
        logedInUser,
      })
    } else {
      res.end("<h1>No file uploaded</h1>")
    }
  } catch (error) {}

  res.end()
})

module.exports = router
