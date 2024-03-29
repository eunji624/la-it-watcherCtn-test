import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { UserModule } from 'src/user/user.module';
import { LiveModule } from 'src/live/live.module';

@Module({
  imports: [
    UserModule,
    LiveModule,
  ],
  controllers: [MainController],
  providers: [MainService],
  exports: [MainService]
})
export class MainModule { }
