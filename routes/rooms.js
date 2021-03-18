const express = require("express")
const router = express.Router()
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
  //NOTE Ändra så att bara offline users syns
  // let allUsersInDb
  // await userModel.find({}, (error, users) => {
  //   if (error) {
  //     console.log("Could not get users from rooms.js")
  //   } else {
  //     allUsersInDb = users
  //   }
  // })

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
  })
})

// NOTE BILD UPPLADDNING // Fixa så att det går att se alla bilder som skickas och inte bara den senaste
router.post("/:room", async (req, res) => {
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
      let file_name = `/uploads/${fileUpload.name}`
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
  res.files = ""

  res.end()
})

module.exports = router
