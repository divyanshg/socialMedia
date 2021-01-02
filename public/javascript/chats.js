$(function () {
    var socket = io();
    var path = window.location.pathname.split('/')
    socket.emit('join', path[path.length - 1])

    document.querySelector('.msgInp').onkeydown = () => {
        sendMsg(this)
    }

    function sendMsg(ele) {
        if (event.key === 'Enter') {
            var msg = document.querySelector('.msgInp').value
            socket.emit('msg', path[path.length - 1], $("#recv").val(),{
                sender: $("#uname").val(),
                text: msg
            })
            document.querySelector('.msgInp').value = ''
            $(".chats").append(`<div class="msg w-full px-2 border-l-4 border-blue-400 bg-gray-200 my-1 h-auto">
        ${msg}
    </div>`)
        }
    }

    socket.on('msg', msg => {
        if (msg.sender == $("#uname").val()) return
        $(".chats").append(`<div class="msg w-full px-2 border-l-4 border-red-400 bg-gray-200 my-1 h-auto">
        ${msg.text}
    </div>`)

    })
})