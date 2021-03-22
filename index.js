const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")
app.set("view engine", "ejs")

///////////////FILE UPLOADING /////////////

const fileUpload = require("express-fileupload")

app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true, // to get rid of unwanted characters
  })
)
///////////// MIDDLEWARES ///////////////
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/public", express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))

/////////// CRYPT /////////////
const session = require("express-session")
const passport = require("passport")
require("./confiq/passport")(passport)

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())

///////////////// ROUTES ///////////////////
const logInRouter = require("./routes/login")
const chatPageRouter = require("./routes/chatPage")
const roomsRouter = require("./routes/rooms")

app.use("/", logInRouter)
app.use("/chatPage", chatPageRouter)
app.use("/rooms", roomsRouter)

//////////////MONGOOSE/////////////////////////
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/slackClone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function () {
  console.log("Connected to DB")
})

///////////// MODELS //////////////////
const userModel = require("./models/users")
const roomModel = require("./models/roomsModel")

////////////////CHAT////////////////////////////
let users = []
io.on("connection", (socket) => {
  //Lets the user connect rightaway to the room
  socket.on("join", (data) => {
    socket.join(data.room)

    const id = socket.id
    const name = data.name
    const user = { id, name }
    users.push(user)
  })

  socket.on("chat", (chatObj) => {
    /////////////// PUSCHA MEDDELANDEN IN I DB ////////////////////
    let room = chatObj.room
    let newMsg = chatObj.msgInput
    let user = chatObj.nameInput
    roomModel.findOneAndUpdate(
      { roomName: room },
      { $push: { messages: `${user}: ${newMsg}` } },
      { new: true },
      (error, data) => {
        if (error) {
          console.log("error updating collection")
        }
      }
    )

    ///////////////////////////////////////////////////////////////////

    io.to(chatObj.room).emit("chat", chatObj)
  })

  socket.on("typing", (data, room) => {
    socket.to(room).broadcast.emit("typing", data, room)
  })
  /////////////////// PRIVATE CHAT //////////////////
  socket.on("startPM", async (data) => {
    const reciverName = data.reciverName
    const sendersName = data.sendersName

    //To get the socket id for the reciver of the PM iam filtering the users array
    let socketId_receiver = users.filter((value) => {
      return value.name === data.reciverName
    })

    let theReciverDoc = await userModel.findOne({ userName: reciverName })
    let reciverID = theReciverDoc._id
    console.log("theReciverDoc", theReciverDoc)

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
    //By using the -1 iam allways getting the latest id from the users array
    io.to(socketId_receiver[socketId_receiver.length - 1].id).emit(
      "alert",
      `You have a PM from ${sendersName} click on the person to open it`
    )
  })
})

http.listen(3000, () => {
  console.log("listening on *:3000")
})
