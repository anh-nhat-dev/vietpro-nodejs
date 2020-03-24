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

    socket.on('GET_ROOMS', (data) => {

        socket.emit('RECEIVER_ROOMS', rooms);

    })
    socket.on('JOIN_ROOM', (data) => {
        console.log("LOGS: data", data);

        const isRoom = rooms.find(room => room.id === data)
        if (isRoom) {
            socket.join(data, () => {
                socket.emit('RECEIVER_JOIN_ROOM', data)
            });
            return;
        }
        socket.emit('RECEIVER_JOIN_ROOM', data)
    });
    socket.on("NEW_MESSAGE", (data) => {
        socket.to(data.currentRoom).broadcast.emit('RECEIVER_NEW_MESSAGE', {
            message: data.message,
            userName: data.userName,
            toRoom: data.currentRoom,
            userId: socket.id
        });
    })
    console.log("Client connected....");
});