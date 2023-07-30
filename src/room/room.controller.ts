import { Controller, Get, Param, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomInstance } from 'twilio/lib/rest/video/v1/room';
import { Room } from './room.entity';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post('create/:name')
  async createGroupRoom(@Param('name') name: string): Promise<RoomInstance> {
    return await this.roomService.createGroupRoom(name);
  }

  @Post('schedule/:name')
  async scheduleRoom(@Param('name') name: string): Promise<Room> {
    return await this.roomService.scheduleAGroupRoom(name);
  }

  @Get('scheduled')
  async getScheduledRooms(): Promise<Room[]> {
    return await this.roomService.findAll();
  }

  @Get('/')
  async getActiveRooms(): Promise<RoomInstance[]> {
    return await this.roomService.getActiveRooms();
  }
}
