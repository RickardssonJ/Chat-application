const socket = io()

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const msgInput = document.getElementById("msgInput")
const nameInput = document.getElementById("nameInput")
const userTyping = document.getElementById("userTyping")

let time = function () {
  var str = ""

  var currentTime = new Date()
  var hours = currentTime.getHours()
  var minutes = currentTime.getMinutes()
  var seconds = currentTime.getSeconds()

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

//-----
const output = document.getElementById("output")

form.addEventListener("submit", (e) => {
  e.preventDefault()
  //Clienten skickar ett chat event till servern som kommer att lyssna efter det
  socket.emit("chat", {
    msgInput: msgInput.value,
    nameInput: nameInput.value,
    room: room,
  })

  msgInput.value = ""
  msgInput.focus()
})

//För att se att användaren skriver.
msgInput.addEventListener("keypress", () => {
  socket.emit("typing", nameInput.value, room)
})

//Clienten lyssnar efter ett chat event ifrån servern
socket.on("chat", (data) => {
  userTyping.innerHTML = ""
  output.innerHTML +=
    "<p><strong>" +
    data.nameInput +
    " " +
    time() +
    " :</br> </strong>" +
    data.msgInput +
    "</p>"
  //window.scrollTo(0, document.body.scrollHeight)
})

//Lyssnar på typing eventet ifrån servern
socket.on("typing", (data, room) => {
  userTyping.innerHTML = "<p><em>" + data + " is typing a message...</em></p>"
})
//////////
//Skickar rummet som användaren ansluter till, tillbaka till servern
socket.emit("room", room)
