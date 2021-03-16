const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")
app.set("view engine", "ejs")

//let onlineArray = require("./public/js/setUserOnline")

// console.log("HELLLLLLOOOO")

///////////////File uppladning /////////////

const fileUpload = require("express-fileupload")

app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true, // to get rid of unwanted characters
  })
)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

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

const userModel = require("./models/users")
const roomModel = require("./models/roomsModel")

//////////////////////////////////////////////

app.use("/public", express.static(path.join(__dirname, "public"))) //Behövs för att vi ska kunna ha tex styling och html i separata filer

////////////////CHAT////////////////////////////

//Funktion som skickar chatt meddelandet vidare till clienten

io.on("connection", (socket) => {
  //Gör så att användaren direkt connectar till rummet man går in i, istället för som tidigare efter att man hade tryckt  på skicka
  socket.on("room", (room) => {
    socket.join(room)
  })

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
    //socket.join(chatObj.room)

    io.to(chatObj.room).emit("chat", chatObj)
  })

  //Server lyssnar efter typing för att se vem som skriver
  socket.on("typing", (data, room) => {
    socket.to(room).broadcast.emit("typing", data, room)
  })

  socket.on("startPM", async (data) => {
    const reciverName = data.reciverName //Innehåller namnet man klickade på
    const sendersName = data.sendersName
    console.log(sendersName)
    console.log(reciverName)

    let theReciverDoc = await userModel.findOne({ userName: reciverName })
    let reciverID = theReciverDoc._id

    let theSenderDoc = await userModel.findOne({ userName: sendersName })
    let senderID = theSenderDoc._id

    //Check to see if a privateroom already exists
    const privateRoom = await roomModel.findOne({
      usersOnline: { $all: [senderID, reciverID] },
    })
    //If it dosent. Creates a new room with the two users inside it
    if (!privateRoom) {
      const newPrivateRoom = new roomModel({
        roomName: `${sendersName}-${reciverName}`,
        messages: [],
        private: true,
        usersOnline: [reciverID, senderID],
      })
      await newPrivateRoom.save((err) => {
        if (err) {
          console.log("No private room was created")
        }
      })
      const url = newPrivateRoom._id
      io.to(socket.id).emit("privateRoom", url)
    } else {
      const url = privateRoom._id
      io.to(socket.id).emit("privateRoom", url)
    }
  })

  socket.on("disconnect", () => {
    //TODO Fixa logg ut
  })
})

http.listen(3000, () => {
  console.log("listening on *:3000")
})
