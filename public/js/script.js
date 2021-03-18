const socket = io()

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const msgInput = document.getElementById("msgInput")
const nameInput = document.getElementById("nameInput")
const userTyping = document.getElementById("userTyping")
const users = document.getElementsByClassName("users")
const output = document.getElementById("output")
const imageDiv = document.getElementById("imageDiv")
const logOutBtn = document.getElementById("logOutBtn")

let timeStamp = function () {
  let str = ""

  let currentTime = new Date()
  let hours = currentTime.getHours()
  let minutes = currentTime.getMinutes()
  let seconds = currentTime.getSeconds()

  if (minutes < 10) {
    minutes = "0" + minutes
  }
  if (seconds < 10) {
    seconds = "0" + seconds
  }
  str += hours + ":" + minutes + ":" + seconds + " "
  if (hours > 11) {
    str += "PM"
  } else {
    str += "AM"
  }
  return str
}

logOutBtn.addEventListener("click", (e) => {
  console.log("Click")
})

// socket.on("users", (data) => {
//   console.log("DATA CLIENT", data)
// })

form.addEventListener("submit", (e) => {
  e.preventDefault()

  socket.emit("chat", {
    msgInput: msgInput.value,
    nameInput: nameInput.value,
    room: room,
    picture: image,
  })

  msgInput.value = ""
  msgInput.focus()
})

msgInput.addEventListener("keypress", () => {
  socket.emit("typing", nameInput.value, room)
})

socket.on("chat", (data) => {
  console.log(data.picture)
  userTyping.innerHTML = ""
  output.innerHTML +=
    "<p><strong>" +
    data.nameInput +
    " " +
    timeStamp() +
    " :</br> </strong>" +
    data.msgInput +
    "</p>"
  output.innerHTML += `<img src="${data.picture}">`

  //window.scrollTo(0, document.body.scrollHeight)
})

socket.on("typing", (data, room) => {
  userTyping.innerHTML = "<p><em>" + data + " is typing a message...</em></p>"
})

for (user of users) {
  user.addEventListener("click", (e) => {
    socket.emit("startPM", {
      reciverName: e.target.textContent,
      sendersName: nameInput.value,
      socketID: socket.id,
    })
  })
}
//Redirects the user that started the private room to that room
socket.on("privateRoom", (url) => {
  window.location.href = `/rooms/${url}`
})

socket.on("alert", (msg) => {
  alert(msg)
})

//Skickar rummet som användaren ansluter till, tillbaka till servern
//NOTE name och socketID behövs inte.
socket.emit("join", {
  room: room,
  name: nameInput.value,
  socketID: socket.id,
})

//socket.emit("disconnect")
