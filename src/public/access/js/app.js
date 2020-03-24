const socket = io.connect("http://localhost:3000");


var userName;
var currentRoom;
const listRooms = $('#list-rooms');
const chatBox = $('#chat-box')

function handelClickConnectRoom(e) {
    e.preventDefault();
    const data = $(this).data();
    joinRoom(data.id)
}

function handelClickConnectClient(e) {
    const data = $(this).data();
    if ($(`#${data.id}`).length) return
    addNewRoom(listRooms, { id: data.id, name: data.name, type: 'client' });
}

function addNewRoom(root, data) {
    root.append(`
  <a id="${data.id}" class="list-group-item list-group-item-action rounded-0" data-id="${data.id}">
    <div class="media">
        <div class="media-body ml-4">
            <div class="d-flex align-items-center justify-content-between mb-1">
                <h6 class="mb-0">${data.type === 'room' ? 'Room' : 'Client'}: ${data.name}</h6>
            </div>
        </div>
    </div>
  </a>`);
}

function addNewMessage(root, data, type) {
    const isSend = type === 'SEND';
    root.append(`
    <div class="media w-50 mb-3 ${isSend ? 'ml-auto' : ''}">
      <div class="media-body ml-3">
          ${isSend ? '' : `<b class="client" data-id="${data.userId}" data-name="${data.userName}">${data.userName}</b>`}
          <div class="${isSend ? 'bg-primary' : 'bg-light'} rounded py-2 px-3 mb-2">
              <p class="text-small mb-0 ${isSend ? 'text-white' : 'text-muted'}">${data.message}</p>
          </div>
      </div>
    </div>`)
}

function joinRoom(id) {
    socket.emit('JOIN_ROOM', id);
}


$(document).ready(() => {


  $(document).on('click', 'a.list-group-item', handelClickConnectRoom);

  $(document).on('click', 'b.client', handelClickConnectClient)

    while (!userName) {
        userName = prompt("Vui lòng nhập tên của bạn", "");
        $('#name').html(userName);
    }
    socket.emit('GET_ROOMS');

    socket.on('RECEIVER_ROOMS', (rooms) => {
        rooms.map(room => {
            addNewRoom(listRooms, {...room, type: 'room' })
        });
        joinRoom(rooms[0].id)
    });
    socket.on('RECEIVER_JOIN_ROOM', (id) => {
        currentRoom = id;
        console.log("LOGS: currentRoom", currentRoom);
        $('#chat-box').html("")
        $(document).find('a.list-group-item.active').removeClass('active');
        $(`#${id}`).addClass('active');
    })

    socket.on('RECEIVER_NEW_MESSAGE', (data) => {

        if (data.toRoom === currentRoom || currentRoom === data.userId) {
            addNewMessage(chatBox, data, 'RECEIVER')
            return
        }
        if ($(`#${data.userId}`).length) return;
        addNewRoom(listRooms, { id: data.userId, name: data.userName, type: 'client' })
    })
    $('#input-message').keyup(function(e) {
        if (e.keyCode === 13) {
            const message = $(this).val();
            if (!message) return

            socket.emit('NEW_MESSAGE', {
                userName,
                currentRoom,
                message
            });
            $(this).val("");
            addNewMessage(chatBox, { message }, 'SEND');
        }
    })
})