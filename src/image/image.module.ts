import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [NestjsFormDataModule],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}
