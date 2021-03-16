socket.on('startPM', async (username) => {
    const userDocument = await Users.findOne({username: username})
    const userID = userDocument._id

    //Can't start a conversation with yourself
    console.log(userID, usersData[socket.id]._id)
    console.log(userID != usersData[socket.id]._id)
    if(userID != usersData[socket.id]._id){
      const privateConvo = await Channels.findOne({users: {$all: [userID, usersData[socket.id]._id]}})
      if(!privateConvo){
        //Skapa ett dokument med ett nytt rum som har båda users i sin userArray.
        const newChannel = new Channels({
          channelname: 'test',
          private: true,
          messages: [],
          users: [userID, usersData[socket.id]._id]
        })
        const newchan = await newChannel.save();

        //Kolla om den andra användaren är online. Om hen är det, skicka den nya privata kanel
        let userdata = Object.entries(usersData)
        const onlineUser = userdata.find(user => user[1]._id == userID)
        if(onlineUser){
          io.to(onlineUser[0]).emit('channelAdded', newchan)
        }
        //Redirecta användaren som klickade på PM
        io.to(socket.id).emit('redirect', `/chat/${newchan._id}`)
      } else {
        io.to(socket.id).emit('redirect', `/chat/${privateConvo._id}`)
      }
    
    }
    
  })