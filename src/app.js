const express = require("express");
const socket = require("socket.io");

const app = express();

app.use("/static", express.static(__dirname + "/public"));

app.get("/chat", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

const server = app.listen((port = 3000), "localhost", function() {
    console.log("Server listen on port : 3000");
});

const io = socket(server);

const rooms = [{
    id: 'giao-luu',
    name: 'Giao Lưu'

}, {
    id: 'ket-ban-bon-phuong',
    name: 'Kết bạn bốn phương'
}];


io.on("connection", function(socket) {

    socket.on('GET_ROOMS', () => {
        socket.emit('RECEIVER_ROOMS', rooms);
    })
    socket.on('JOIN_ROOM', (id) => {
        const isRoom = rooms.find(room => room.id === id)
        if (isRoom) {
            socket.join(id, () => {
                socket.emit('RECEIVER_JOIN_ROOM', { id, isRoom: true })
            });
            return;
        }
        socket.emit('RECEIVER_JOIN_ROOM', { id, isRoom: false })
    });
    socket.on("NEW_MESSAGE", (data) => {
        socket.to(data.currentWindow.id).broadcast.emit('RECEIVER_NEW_MESSAGE', {
            message: data.message,
            userName: data.userName,
            to: data.currentWindow.id,
            from: socket.id,
            isRoom: data.currentWindow.isRoom
        });
    })
    console.log("Client connected....");
});