import { Injectable } from '@nestjs/common';
import { TwilioService } from '../twilio/twilio.service';
import { RoomInstance } from 'twilio/lib/rest/video/v1/room';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoomService {
  constructor(
    private twilioService: TwilioService,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async getLinkShortUrl(roomName: string): Promise<string> {
    // TODO: check if room exists in db using `roomName`
    // TODO: check room status in db
    // TODO: if room is "in-progress", return room
    // TODO: if room does not exist, create and return room
    // TODO: if room is not active return room
    // TODO: if room is expired, delete room and create new room
  }

  async createAndStartRoom(roomName: string): Promise<RoomInstance> {
    const room = await this.twilioService.findOrCreateRoom({
      uniqueName: roomName,
      type: 'group',
      emptyRoomTimeout: 10,
    });
    return room;
  }

  // FOR TESTING ONLY
  async scheduleAGroupRoom(roomName: string): Promise<Room> {
    const room = new Room();
    room.name = roomName;
    room.participants = ['joe'];
    room.status = 'not-started';
    room.scheduled_at = new Date();
    return await this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  // deprecated?
  async createGroupRoom(roomName: string): Promise<RoomInstance> {
    const room = await this.twilioService.findOrCreateRoom({
      uniqueName: roomName,
      type: 'group',
      emptyRoomTimeout: 10,
    });
    return room;
  }

  async getActiveRooms(): Promise<RoomInstance[]> {
    return await this.twilioService.getActiveRooms();
  }
}
