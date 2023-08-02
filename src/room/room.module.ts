import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { ParticipantModule } from '../participant/participant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), ParticipantModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
