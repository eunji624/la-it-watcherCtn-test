import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

import { ChatService } from './chat.service';
import { SearchDto } from './dto/chat.dto';
import { Inject, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { EnterRoomSuccessDto } from './types/res.types';
import { WsGuard } from 'src/auth/guards/chat.guard';
import { searchProhibitedWords } from './forbidden.words';
import { LiveService } from 'src/live/live.service';

@WebSocketGateway({
    cors: {
        //origin: ['ws://도메인주소적기/live'],
        origin: '*',
    },
})
@UseGuards(WsGuard)
export class ChatGateway {
    @WebSocketServer() server: Server;
    constructor(
        private readonly chatService: ChatService,
        @Inject(LiveService)
        private readonly liveService: LiveService,
    ) {}

    @SubscribeMessage('create_room')
    async createLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        console.log('방 만드는중');
        const createChatRoom = await this.chatService.createChatRoom(channelId, client);
        return createChatRoom;
        return true;
    }

    @SubscribeMessage('stop_live')
    async deleteChatRoom(client: Socket, channelId: string) {
        const deleteChatRoom = await this.chatService.deleteChatRoom(channelId, client);
        return 'intervalEnd';
    }

    //@OnGatewayDisconnect()
    //async streamerDisconnect({ client, channelId, userId }: { client: Socket; channelId: string; userId: number; }) {
    //    console.log('스트리머가 방을 나가버림');
    //}

    @SubscribeMessage('enter_room')
    async enterLiveRoomChat(client: Socket, channelId: string): Promise<EnterRoomSuccessDto> {
        console.log('방입장했슈~~');
        //TODO 유저가 들어오면 기존 채팅 50개 보여주기 추후 구현 예정.
        const chats = await this.chatService.enterLiveRoomChat(channelId, client);
        //console.log('게이트웨이', chats);
        //for (let i = 0; i < chats.length; i++) {
        //    //this.server.to(liveId).emit('sending_message', chats[content], chats[nickname]);
        //}

        console.log('가져왓슈~', chats);
        for (let i = 0; i < chats.length; i++) {
            this.server.to(channelId).emit('sending_message', chats[i].message.content, chats[i].message.nickname);
        }

        return {
            statusCode: 200,
            message: '채팅방 입장 성공',
            data: chats,
        };
    }

    //TODO 방송 종료하면 나가기
    @SubscribeMessage('exit_room')
    async exitLiveRoomChat(client: Socket, channelId: string): Promise<any> {
        console.log('exit_room에 왔음', channelId);
        const moveChatData = await this.chatService.liveChatDataMoveMongo(channelId, 0);
        console.log('캐시데이터 비우고 몽고에 넣음');

        const endLive = await this.liveService.end(+channelId);
        console.log('endLive함수 정상 작동', endLive);

        console.log('endLive', endLive);
        if (endLive) {
            return this.server.to(channelId).emit('bye');
        }
    }

    @SubscribeMessage('new_message')
    async createChat(client: Socket, [value, channelId]: [value: string, channelId: string]) {
        const { userId, nickname } = client.handshake.auth.user;
        const filterWord = await searchProhibitedWords(value);

        if (filterWord) {
            return this.server.to(client.id).emit('alert', '허용하지 않는 단어입니다.');
        }

        const saveChat = await this.chatService.createChat(client, value, channelId, userId, nickname);
        console.log('saveChat', saveChat);
        if (saveChat === 'sameChat') {
            console.log('같은내용임 ');
            return this.server.to(client.id).emit('alert', '동일한 내용의 채팅입니다. 잠시 후 다시 시도해 주세요.');
        }
        if (saveChat === 'toFastChat') {
            console.log('빨라유 ');
            return this.server.to(client.id).emit('alert', '메세지를 전송할 수 없습니다. 메세지를 너무 빨리 보냈습니다.');
        }
        return this.server.to(channelId).emit('sending_message', value, nickname);
    }

    @SubscribeMessage('get_all_chat_by_channelId')
    async getAllChatByChannelId(client: Socket, channelId: string) {
        const socketId = client.id;
        const messages = await this.chatService.getAllChatByChannelId(channelId);
        return this.server.emit('receive_all_chat', messages);
    }

    @SubscribeMessage('getSearchChatMessage')
    async getSearchChatMessage(@MessageBody() searchDto: SearchDto, payload: { channelId: string }) {
        const { channelId } = payload;
        const findMessage = this.chatService.getSearchChatMessage(searchDto.searchValue, channelId);
        return this.server.emit('receiveGetSearchChatMessage', findMessage);
    }

    //수정 기능 고민중
    //@SubscribeMessage('updateChat')
    //async updateChat(@MessageBody() updateChatDto: UpdateChatDto, payload: { userId: number; channelId: string }) {
    //  const {userId, channelId} = payload;
    //  const updateChat = await this.chatService.updateChat(userId, channelId);

    //  return this.server.emit('receiveUpdateChat')
    //}
}
