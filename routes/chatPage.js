const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../confiq/auth")

const roomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

router.get("/", ensureAuthenticated, async (req, res) => {
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

  //Get all non private rooms
  await roomModel.find({ private: false }, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  res.render("chatPage", { rooms, logedInUser, userDoc })
})

//Creating the new room
router.post("/", ensureAuthenticated, (req, res) => {
  const newRoom = new roomModel({
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
      let file_name = `/uploads/${logedInUser}_profilPic.jpg`
      await profilPicUpload.mv(`.${file_name}`) //Flyttar in filen i våran mapp

      //Find user and update profil picture
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

//Change username and/or Email
router.post("/change/:userName", ensureAuthenticated, (req, res) => {
  let newUserName = req.body.newUserName
  let newUserMail = req.body.newUserMail
  let user = req.user.userName

  userModel.findOneAndUpdate(
    { userName: user },
    { $set: { userName: newUserName, userMail: newUserMail } },
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

module.exports = router
