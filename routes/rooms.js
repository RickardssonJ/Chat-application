const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../confiq/auth")

const roomModel = require("../models/roomsModel")
const userModel = require("../models/users")

router.use(express.urlencoded({ extended: true }))

let rooms = []
let room = {}

router.get("/:room", ensureAuthenticated, async (req, res) => {
  let userDoc = req.user
  console.log(userDoc)

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

  //Get all nonprivate rooms
  await roomModel.find({ private: false }, (error, data) => {
    if (error) return handleError(error)
    rooms = data
  })

  await roomModel.findOne({ _id: req.params.room }, (error, data) => {
    if (error) return handleError(error)
    room = data
  })

  res.render("room", {
    rooms,
    room,
    usersOnline,
    logedInUser: req.user.userName,
    usersOffline,
    userDoc,
  })
})

module.exports = router
