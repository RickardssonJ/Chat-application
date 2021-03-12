const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")
app.set("view engine", "ejs")

///////////////File uppladning /////////////

const fileUpload = require("express-fileupload")

app.use(
  fileUpload({
    createParentPath: true,
  })
)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// app.post("/image", async (req, res) => {
//   let images = []
//   try {
//     if (req.files) {
//       let fileUpload = req.files.fileUpload //Namnet på inputfältet profile_pic
//       let file_name = `./uploads/${fileUpload.name}`
//       await fileUpload.mv(file_name) //Flyttar in filen i våran mapp
//       images.push(file_name)
//       res.render("room", images)
//     } else {
//       res.end("<h1>No file uploaded</h1>")
//     }
//   } catch (error) {}
// })
///////////////////////////////////////////

/////////// CRYPT /////////////
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

///////////////// ROUTES ///////////////////
const indexRouter = require("./routes/index")
const chatPageRouter = require("./routes/chatPage")
const roomsRouter = require("./routes/rooms")

app.use("/", indexRouter)
app.use("/chatPage", chatPageRouter)
app.use("/rooms", roomsRouter) //Bytt tillbaka rill "/"
//app.use("/", roomsRouter)

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

// const NewUserModel = require("./models/users")
// const NewRoomModel = require("./models/roomsModel")

//////////////////////////////////////////////

app.use("/public", express.static(path.join(__dirname, "public"))) //Behövs för att vi ska kunna ha tex styling och html i separata filer

////////////////CHAT////////////////////////////

//Funktion som skickar chatt meddelandet vidare till clienten
io.on("connection", (socket) => {
  //TODO console.log(" Nu har jag kontakt")
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

  socket.on("disconnect", () => {
    //TODO Fixa logg ut
  })
})

http.listen(3000, () => {
  console.log("listening on *:3000")
})
