////const getAccessToken = getCookie('Authorization');

//const socket = io({
//    auth: {
//        token: `${getAccessToken}`,
//    },
//});

//const chatRecord = document.querySelector('.record');

//let roomNum;

////방 선택하면 서버에게 알려주는 애.
//document.addEventListener('DOMContentLoaded', function () {
//    chatRecord.addEventListener('click', getAllChatByLiveId);
//});

////채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
//function getAllChatByLiveId(e) {
//    e.preventDefault();
//    const liveId = e.target.id;
//    console.log('채널메세지 가져오기 아이디', liveId);
//    socket.emit('get_all_chat_by_liveId', liveId);
//    socket.on('receive_all_chat', (message) => {
//        console.log('프론트 message', message);
//    });
//}
