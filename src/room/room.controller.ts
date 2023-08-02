import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { ScheduleRoomDto } from './dto/ScheduleRoomDto';

@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post('schedule')
  async scheduleRoom(
    @Body() scheduleRoomDto: ScheduleRoomDto,
  ): Promise<string> {
    const room = await this.roomService.scheduleRoom(scheduleRoomDto);
    return room.roomId;
  }

  @Get(':roomId/users/:userId')
  async authoriseUserForRoom(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ): Promise<string> {
    const room = await this.roomService.getRoomIfAccessible(roomId);
    return await this.roomService.authoriseUserAndGetToken(room, userId);
  }

  // WIP (needs to be public url before it can work)
  @Get('status')
  async twilioStatusCallback(args: any): Promise<any> {
    console.log(args);
    return args;
  }
}
