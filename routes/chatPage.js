const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../confiq/auth")

const NewRoomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

router.get("/", ensureAuthenticated, async (req, res) => {
  let rooms = {}
  let usersOnline
  let logedInUser = req.user.userName
  let userDoc = req.user

  //Set user online
  await userModel.findOneAndUpdate(
    { userName: req.user.userName },
    { $set: { userOnline: true } },
    { new: true },
    (error, data) => {
      if (error) {
        console.log("User not signed in")
      }
    }
  )

  //Get all users thats online
  await userModel.find({}, (error, users) => {
    if (error) return handleError(error)

    usersOnline = users.filter((user) => {
      return user.userOnline == true
    })
  })

  // await userOnline.forEach((user) => {
  //   user.addEventListener("click", (e) => {
  //     console.log(e.target)
  //   })
  // })
  //console.log(usersOnline)

  //Gets all the rooms from the database
  //NOTE orginal koden await NewRoomModel.find({}, "roomName", (error, data) =>
  await NewRoomModel.find({ private: false }, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })
  res.render("chatPage", { rooms, usersOnline, logedInUser, userDoc })
})

//Creating the new room
router.post("/", ensureAuthenticated, (req, res) => {
  const newRoom = new NewRoomModel({
    roomName: req.body.newRoomName,
    messages: [],
    private: false,
    userOnline: [],
  })
  newRoom.save((err) => {
    if (err) {
      return console.log("error creating new room")
    }
    res.redirect("/chatPage")
  })
})

//Profil picture upload
router.post("/:profilPic", ensureAuthenticated, async (req, res) => {
  let logedInUser = req.user.userName

  try {
    if (req.files) {
      let profilPicUpload = req.files.profilPicUpload //Namnet på inputfältet
      //let file_name = `/uploads/${fileUpload.name}`
      let file_name = `/uploads/${logedInUser}_profilPic.jpg`
      await profilPicUpload.mv(`.${file_name}`) //Flyttar in filen i våran mapp

      userModel.findOneAndUpdate(
        { userName: logedInUser },
        { profilPic: file_name },
        { new: true },
        (error, data) => {
          if (error) {
            console.log("error updating collection")
          } else {
            console.log(data)
          }
        }
      )

      res.redirect("/chatPage")
    } else {
      res.end("<h1>No file uploaded</h1>")
    }
  } catch (error) {}
})

router.post("/change/:userName", ensureAuthenticated, (req, res) => {
  console.log(req.body.newUserName)
  let newUserName = req.body.newUserName
  let user = req.user.userName

  userModel.findOneAndUpdate(
    { userName: user },
    { userName: newUserName },
    { new: true },
    (error) => {
      if (error) {
        console.log("error changing user name")
      } else {
        console.log("User name changed")
      }
    }
  )

  res.redirect("/chatPage")
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
