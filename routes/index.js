const express = require("express")
const router = express.Router()

//Crypt Från Micke
const bcrypt = require("bcrypt")
const passport = require("passport")
////////////////////////
//Importing the new user model
const NewUserModel = require("../models/users")

router.get("/", (req, res) => {
  res.render("landingPage.ejs", { welcomeText: "Create account" })
})

//////////////////// KOD FRÅN MICKE ////////////////////

router.get("/register", (req, res) => {
  res.render("register.ejs")
})

router.get("/login", (req, res) => {
  res.render("login.ejs")
})

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/chatPage",
    failureRedirect: "/login",
  })(req, res, next)
})

////////////////////////////////////////////////////////

// router.post("/save", (req, res) => {
//   //Using the newUserModell to create a new user
//   const newUser = new NewUserModel({
//     userName: req.body.userName,
//     userMail: req.body.userMail,
//     userPassword: req.body.userPassword,
//   })

//   newUser.save((err, newUser) => {
//     if (err) {
//       return console.log("error uploading user")
//     }
//     console.log("NewUser uploaded")
//     res.redirect("/")
//   })
// })

router.post("/save", (req, res) => {
  //Using the newUserModell to create a new user
  const newUser = new NewUserModel({
    userName: req.body.userName,
    userMail: req.body.userMail,
    userPassword: req.body.userPassword,
    userOnline: true,
  })

  //Krypterar lösenordet
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.userPassword, salt, (err, hash) => {
      if (err) throw err
      //save pass to hash
      newUser.userPassword = hash
      //save user
      newUser
        .save()
        .then((value) => {
          console.log(value)
          res.redirect("/login")
        })
        .catch((value) => console.log(value))
    })
  )
})

module.exports = router
