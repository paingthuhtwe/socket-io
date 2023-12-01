const express = require("express");
const app = express();
const cors = require('cors');
const socket = require('socket.io');
const fileUplaod = require('express-fileupload');

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUplaod());

app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/public/index.html');
})
// Start the server
const PORT = 4444;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// Socket Setup 
const io = socket(server);

let connectedUsersCount = 0;
io.on('connection', (socket) => {
    socket.on('messages', data => {
        io.sockets.emit('messages', data)
    })
    socket.on('typing', data => {
        socket.broadcast.emit('typing', data)
    })

    connectedUsersCount++;
    io.emit('connectedUsersCount', connectedUsersCount);

    socket.on('disconnect', () => {
      connectedUsersCount--;
      io.emit('connectedUsersCount', connectedUsersCount);
  });
})