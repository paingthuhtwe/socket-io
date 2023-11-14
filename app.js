const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const socket = require('socket.io');

// Middleware
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/public/index.html');
})

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// Socket Setup 
const io = socket(server);

io.on('connection', (socket) => {
    console.log('Socket connection connected.' + ' ' +socket.id);
    socket.on('messages', data => {
        io.sockets.emit('messages', data)
    })
    socket.on('typing', data => {
        socket.broadcast.emit('typing', data)
        console.log(data)
    })
})