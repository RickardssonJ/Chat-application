const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const User = require("../models/users")

const passport_function = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "userMail",
        passwordField: "userPassword",
      },
      function (username, password, done) {
        User.findOne({ userMail: username }, function (error, user) {
          if (error) {
            return done(error)
          }

          if (!user) {
            return done(null, false, { message: "Incorrect username." })
          }

          bcrypt.compare(password, user.userPassword, (error, isMatch) => {
            if (error) {
              throw error
            }

            if (isMatch) {
              return done(null, user)
            } else {
              return done(null, false, { message: "Incorrect password." })
            }
          })
        }).catch((error) => console.log(error))
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => {
      done(error, user)
    })
  })
}

module.exports = passport_function
