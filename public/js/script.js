const socket = io()

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const msgInput = document.getElementById("msgInput")
const nameInput = document.getElementById("nameInput") //NOTE Behövs inte
const userTyping = document.getElementById("userTyping")
const users = document.getElementsByClassName("users")
const output = document.getElementById("output")

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

// for (user of users) {
//   user.addEventListener("click", (e) => {
//     socket.emit("startPM", e.target.textContent, socket.id)
//     let senderName = nameInput.value
//     console.log(senderName)
//   })
// }

for (user of users) {
  user.addEventListener("click", (e) => {
    socket.emit("startPM", {
      reciverName: e.target.textContent,
      sendersName: nameInput.value,
      socketID: socket.id,
    })
  })
}

socket.on("privateRoom", (url) => {
  window.location.href = `/rooms/${url}`
})
//-----

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
    timeStamp() +
    " :</br> </strong>" +
    data.msgInput +
    "</p>"
  //window.scrollTo(0, document.body.scrollHeight)
})

//Lyssnar på typing eventet ifrån servern
socket.on("typing", (data, room) => {
  userTyping.innerHTML = "<p><em>" + data + " is typing a message...</em></p>"
})

//Skickar rummet som användaren ansluter till, tillbaka till servern
socket.emit("room", room)
