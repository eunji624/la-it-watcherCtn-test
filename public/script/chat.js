const path = window.location.pathname;

const socket = io({
    auth: {
        token: `Bearer ${getCookie('Authorization')}`,
    },
});

console.log('path확인', path);
console.log('소켓 연결 확인', socket);

const chatBox = document.querySelector('#chatBox');
const chatNickname = document.querySelector('#chatNickname');
const chatText = document.querySelector('#chatText');
const oneChat = document.querySelector('#oneChat');
const chatInputText = document.querySelector('.chatInputText');

let roomNum;

if (path.includes('streaming')) {
    //방송종료
    const endChat = document.querySelector('#liveEndBtn');
    const sendChatBtnStreamerPage = document.querySelector('#sendChatBtnStreamerPage');

    //방 선택하면 서버에게 알려주는 애.
    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(11);
        const enterRoom = socket.emit('enter_room', channelId);
        console.log('두둥', enterRoom, '---');
        roomNum = channelId;
        console.log('스트리머 룸 아이디', roomNum);
        sendChatBtnStreamerPage.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if ((e.keyCode === 13) | (e.which === 13)) {
                chatSending(e);
            }
        });

        endChat.addEventListener('click', function (e) {
            console.log('방송 끝');
            //해당 방에 있는 전체 유저한테 방송 끝났다고 알러트 보내기.

            //addMessage('해당 방송이 종료되었습니다.', '시스템');
            //const url = `${URL}/`;
            //window.location.href = url;
            return socket.emit('exit_room', channelId);
        });
    });
} else if (path.includes('live')) {
    const sendChatBtn = document.querySelector('#sendChatBtn');
    //const chatRecord = document.querySelector('#record');

    //방 선택하면 서버에게 알려주는 애.
    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(6);
        const enterRoom = socket.emit('enter_room', channelId);
        console.log('두둥', enterRoom, '---');
        roomNum = channelId;
        console.log('라이브 아이디', roomNum);

        sendChatBtn.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                chatSending(e);
            }
        });
    });
}

//채팅 메시지 보내기
function chatSending(e) {
    e.preventDefault();
    console.log('채팅메세지');
    const chatInput = document.querySelector('.chatInputText');
    console.log('chatInput', chatInput.value, roomNum);
    socket.emit('new_message', chatInput.value, roomNum);
}

//메세지 받아오기
socket.on('sending_message', (msg, nickname) => {
    console.log('받은거', msg, nickname);
    addMessage(msg, nickname);
});

//금칙어_ 허용하지 않는 단어입니다.
socket.on('alert', (msg) => {
    console.log('받은거', msg);
    alert(msg);
    //addMessage(msg, nickname);
});

//방송 종료시 알림.경로 이동
socket.on('bye', () => {
    console.log('종료 bye 실행중');
    alert('방송이 종료되었습니다.');
    const url = `${URL}/`;
    return (window.location.href = url);
});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByChannelId(e) {
    e.preventDefault();
    const channelId = e.target.id;
    return socket.emit('get_all_chat_by_channelId', channelId);
}

//메세지 그리기
function addMessage(msg, nickname) {
    console.log('==>', msg, nickname);
    const temp = ` <div class="chatList" id="oneChat"><span class="chatNickname">${nickname}</span> ${msg}</div>`;
    chatBox.insertAdjacentHTML('beforeend', temp);
    return (chatInputText.value = '');
}

////토큰 가져오는 함수
//function getCookie(access_token) {
//    const cookieArr = document.cookie.split(';');
//    const getToken = cookieArr.filter((e) => {
//        if (e.split('=')[0] === 'access_token') {
//            return e.split('=')[1];
//        }
//    });
//    return getToken;
//}
