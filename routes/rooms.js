const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../confiq/auth")

const roomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

let rooms = []
let room = {}

router.get("/:room", ensureAuthenticated, async (req, res) => {
  let images = []
  let userDoc = req.user

  //Get all offline users
  await userModel.find({}, (error, users) => {
    if (error) return handleError(error)

    usersOffline = users.filter((user) => {
      return user.userOnline == false
    })
  })

  //Get all online users
  await userModel.find({}, (error, users) => {
    if (error) return handleError(error)

    usersOnline = users.filter((user) => {
      return user.userOnline == true
    })
  })

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

module.exports = router
