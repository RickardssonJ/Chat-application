const socket = io()

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const msgInput = document.getElementById("msgInput")
const nameInput = document.getElementById("nameInput")
const userTyping = document.getElementById("userTyping")
const users = document.getElementsByClassName("users")
const output = document.getElementById("output")
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

function updateScroll() {
  const chatWindow = document.getElementById("chat-window")
  chatWindow.scrollTop = chatWindow.scrollHeight
}

form.addEventListener("submit", (e) => {
  e.preventDefault()

  socket.emit("chat", {
    msgInput: msgInput.value,
    nameInput: nameInput.value,
    room: room_name,
  })

  msgInput.value = ""
  msgInput.focus()
})

msgInput.addEventListener("keypress", () => {
  socket.emit("typing", nameInput.value, room_name)
})

socket.on("chat", (data) => {
  userTyping.innerHTML = ""
  output.innerHTML +=
    "<p>" +
    `<img id="profilInChat" src="/uploads/${data.nameInput}_profilPic.jpg"></img>` +
    "<strong>" +
    data.nameInput +
    " " +
    timeStamp() +
    " :</br> </strong>" +
    data.msgInput +
    "</p>"

  updateScroll()
})

socket.on("typing", (data, room) => {
  userTyping.innerHTML = "<p><em>" + data + " is typing a message...</em></p>"
})

for (user of users) {
  user.addEventListener("click", (e) => {
    socket.emit("startPM", {
      reciverName: e.target.innerText,
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

socket.emit("join", {
  room: room_name,
  name: nameInput.value,
  socketID: socket.id,
})
