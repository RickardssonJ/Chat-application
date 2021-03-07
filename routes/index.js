const express = require("express")
const router = express.Router()

//Importing the new user model
const NewUserModel = require("../models/users")

router.get("/", (req, res) => {
  res.render("landingPage.ejs", { welcomeText: "Create account" })
})

router.post("/save", (req, res) => {
  //Using the newUserModell to create a new user
  const newUser = new NewUserModel({
    userName: req.body.userName,
    userMail: req.body.userMail,
    userPassword: req.body.userPassword,
  })
  newUser.save((err, newUser) => {
    if (err) {
      return console.log("error uploading user")
    }
    console.log("NewUser uploaded")
    res.redirect("/")
  })
})

module.exports = router
