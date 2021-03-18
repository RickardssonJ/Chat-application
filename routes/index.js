const express = require("express")
const router = express.Router()
const NewUserModel = require("../models/users")

const userModel = require("../models/users")

//////////// CRYPT ////////////
const bcrypt = require("bcrypt")
const passport = require("passport")
const { route } = require("./chatPage")

/////////////////// ROUTES //////////////////
router.get("/", (req, res) => {
  res.render("landingPage", { welcomeText: "Create account" })
})

router.get("/register", (req, res) => {
  res.render("register")
})

router.get("/login", (req, res) => {
  res.render("login")
})

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/chatPage",
    failureRedirect: "/login",
  })(req, res, next)
})

router.post("/save", (req, res) => {
  const newUser = new NewUserModel({
    userName: req.body.userName,
    userMail: req.body.userMail,
    userPassword: req.body.userPassword,
    userOnline: true,
  })

  //Encrypts the password
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

////////////// LOGOUT THE USER /////////////////////
router.get("/login/:logout", async (req, res) => {
  await userModel.findOneAndUpdate(
    { userName: req.user.userName },
    { $set: { userOnline: false } },
    { new: true },
    (error, data) => {
      if (error) {
        console.log("User not signed out")
      } else {
        console.log("User signed out")
      }
    }
  )

  res.redirect("/")
})

module.exports = router
