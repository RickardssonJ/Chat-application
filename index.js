const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")
app.set("view engine", "ejs")

/////////// CRYPT Från Micke /////////////
const session = require("express-session")
const passport = require("passport")
require("./confiq/passport")(passport)

//Sessions
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())
////////////////////////////////////
//Let express read html forms
app.use(express.urlencoded({ extended: true }))

/////////////////////TEST KOD ///////////////////
const indexRouter = require("./routes/index")
const chatPageRouter = require("./routes/chatPage")
const roomsRouter = require("./routes/rooms")

app.use("/", indexRouter)
app.use("/chatPage", chatPageRouter)
app.use("/", roomsRouter)

//////////////////////////////////////////////

//////////////MONGOOSE/////////////////////////

const mongoose = require("mongoose")
//const connection = stod på raden under tidigare
mongoose.connect("mongodb://localhost:27017/slackClone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function () {
  console.log("Connected to DB")
})

const NewUserModel = require("./models/users")
const NewRoomModel = require("./models/roomsModel")

//////////////////////////////////////////////

app.use("/public", express.static(path.join(__dirname, "public"))) //Behövs för att vi ska kunna ha tex styling och html i separata filer

const rooms = { JavaScript: {}, NodeJS: {}, DataBases: {} }

//////////////////RUM///////////////////////////

// app.get("/", (req, res) => {
//   res.render("landingPage.ejs", { welcomeText: "Please login" })
// })

// app.post("/save", (req, res) => {
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

// app.get("/chatPage", (req, res) => {
//   //Hämtar alla rummen
//   NewRoomModel.find({}, "roomName", (error, rooms) => {
//     if (error) return handleError(error)
//     //res.redirect("/")
//     res.render("chatPage.ejs", { rooms })
//   })
//   //res.render("chatPage.ejs", { rooms: rooms })
// })

// app.post("/chatPage", (req, res) => {
//   const newRoom = new NewRoomModel({
//     roomName: req.body.newRoomName,
//     messages: [],
//     userOnline: [],
//   })
//   newRoom.save((err) => {
//     if (err) {
//       return console.log("error creating new room")
//     }
//     res.redirect("/chatPage")
//   })
// })

// app.get("/:room", (req, res) => {
//   NewRoomModel.find({}, "roomName", (error, rooms) => {
//     if (error) return handleError(error)
//     let room = req.params.room
//     res.render("room.ejs", { rooms, room: room })
//   })

//   //console.log(req.params.room)
//   // res.render("room.ejs", { room: req.params.room, rooms: rooms })
// })
////////////////CHAT////////////////////////////

//Funktion som skickar chatt meddelandet vidare till clienten
io.on("connection", (socket) => {
  //Servern lyssnar efter chat eventet och skickar rillbaka chatObj till clienten

  socket.on("chat", (chatObj) => {
    /////////////// PUSCHA MEDDELANDEN IN I DB ////////////////////

    // let room = chatObj.room
    // let newMsg = chatObj.msgInput
    // let user = chatObj.nameInput
    // NewRoomModel.findOneAndUpdate(
    //   { roomName: room },
    //   { $push: { messages: `${user}: ${newMsg}` } },
    //   { new: true },
    //   (error, data) => {
    //     if (error) {
    //       console.log("error updating collection")
    //     } else {
    //       console.log(data)
    //     }
    //   }
    // )

    ///////////////////////////////////////////////////////////////////
    socket.join(chatObj.room)
    io.to(chatObj.room).emit("chat", chatObj)
    console.log(socket.id)
  })

  //Server lyssnar efter typing för att se vem som skriver
  socket.on("typing", (data, room) => {
    socket.to(room).broadcast.emit("typing", data, room)
  })
})

http.listen(3000, () => {
  console.log("listening on *:3000")
})
