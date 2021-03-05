const socket = io()

const messages = document.getElementById("messages")
const form = document.getElementById("form")
const msgInput = document.getElementById("msgInput")
const nameInput = document.getElementById("nameInput")
const userTyping = document.getElementById("userTyping")

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
})

//För att se att användaren skriver.
msgInput.addEventListener("keypress", () => {
  socket.emit("typing", nameInput.value, room)
})

//Clienten lyssnar efter ett chat event ifrån servern
socket.on("chat", function (data) {
  userTyping.innerHTML = ""
  output.innerHTML +=
    "<p><strong>" + data.nameInput + ": </strong>" + data.msgInput + "</p>"
  //window.scrollTo(0, document.body.scrollHeight)
})

//Lyssnar på typing eventet ifrån servern
socket.on("typing", (data, room) => {
  console.log(room)
  userTyping.innerHTML = "<p><em>" + data + " is typing a message...</em></p>"
})
