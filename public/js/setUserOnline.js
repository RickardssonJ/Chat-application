///////////////
const signInBtn = document.getElementById("signInBtn")
const userNameInput = document.getElementById("userNameInput")

let usersOnline = []

signInBtn.addEventListener("click", async (e) => {
  let userName = userNameInput.value
  await usersOnline.push(userName)
  return usersOnline
})
console.log(usersOnline)
//////////////

//module.exports = userOnlineArray
