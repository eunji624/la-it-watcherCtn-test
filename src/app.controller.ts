import { MainService } from './main/main.service';
import { UserService } from './user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { LiveService } from './live/live.service';
import { UserInfo } from './common/decorator/user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { UserAfterAuth } from './auth/interfaces/after-auth';

@ApiTags('Frontend')
@Controller()
export class AppController {
    constructor(
        private readonly userService: UserService,
        private readonly liveService: LiveService,
        private readonly mainService: MainService,
    ) {}

    @Get()
    @Render('main') // Render the 'main' EJS template
    async main(@Req() req) {
        const lives = await this.liveService.findAll();
        console.log('lives', lives);
        return { title: 'Home Page', path: req.url, lives: lives };
    }

    @Get('live/:liveId')
    @Render('main') // Render the 'main' EJS template
    async live(@Param('liveId') liveId: string, @Res() res: Response) {
        const live = await this.liveService.findOne(+liveId);
        return { title: 'Live - User view page', path: '/live', live: live };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-page')
    async userInfo(@UserInfo() user: UserAfterAuth) {
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.findChannelIdByUserId(user.id);
        return channel.channelId;
    }

    @Get('my-page/:channelId')
    @Render('main') // Render the 'main' EJS template
    async myInfo(@Param('channelId') channelId: number) {
        console.log('_________');
        // 내채널 클릭 시 Id값 필요
        const channel = await this.userService.FindChannelIdByChannel(channelId);
        console.log('channel가져옴', channel);
        return { title: 'My Page', path: '/my-page', channel: { ...channel, channelId: channelId } };
        //return { title: 'User - channel info view page', path: '/my-page', live: live };
    }

    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    @Get('streaming/:channelId')
    @Render('main') // Render the 'main' EJS template
    async provideLive(@Param('channelId') channelId: string) {
        console.log('ch ID =====> ', channelId);
        const channel = await this.userService.FindChannelIdByChannel(+channelId);
        // console.log('ch ==> ', channel);
        // const live = await this.liveService.findOneByChannelId(+channelId);
        // console.log('live: ', live);

        return { title: 'Streaming Page', path: '/streaming', channel };
    }

    @Render('main') // Render the 'main' EJS template
    @Get('search/:value')
    async searchPage(@Param('value') search: string) {
        const findValue = await this.mainService.findByBJName(search);
        console.log(findValue);
        return { title: 'Search Page', path: '/search', findValue };
    }
}
