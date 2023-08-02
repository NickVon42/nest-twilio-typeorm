import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TwilioService } from '../twilio/twilio.service';
import { RoomInstance } from 'twilio/lib/rest/video/v1/room';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleRoomDto } from './dto/ScheduleRoomDto';
import { nanoid } from 'nanoid';
import { ParticipantService } from '../participant/participant.service';

@Injectable()
export class RoomService {
  constructor(
    private twilioService: TwilioService,
    private participantService: ParticipantService,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  /**
   * @throws UnauthorizedException - if the user is not authorized for the room
   * */
  async authoriseUserAndGetToken(room: Room, userId: string): Promise<string> {
    const participant = await this.participantService.findParticipantForRoom(
      userId,
      room,
    );

    if (!participant) {
      throw new UnauthorizedException(
        'User not authorized for the specified room',
      );
    }

    const token = await this.twilioService.createRoomGrant(
      room.name ?? room.roomId,
      participant.participantId,
    );
    return token;
  }

  /**
   * @throws NotFoundException - if the room does not exist
   * @throws ForbiddenException - if the room is not accessible at the current time
   * */
  async getRoomIfAccessible(roomId: string): Promise<Room> {
    const room = await this.roomRepository.findOneBy({ roomId });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!RoomService.isRoomAccessibleByTime(room.startTime, room.endTime)) {
      throw new ForbiddenException('Room is not accessible at this time');
    }

    return room;
  }

  /**
   * @param startBuffer - number of minutes before the start time that the room is accessible
   * */
  private static isRoomAccessibleByTime(
    startTime: Date,
    endTime: Date,
    startBufferInMs: number = 10 * 60 * 1000,
  ): boolean {
    const currentTime = new Date();
    const startTimeMinus10Minutes = new Date(
      startTime.getTime() - startBufferInMs,
    );

    const isRoomAccessible =
      currentTime >= startTimeMinus10Minutes && currentTime <= endTime;

    if (!isRoomAccessible) {
      throw new ForbiddenException('Room is not accessible at this time');
    }

    return isRoomAccessible;
  }

  async scheduleRoom(scheduleRoomDto: ScheduleRoomDto): Promise<Room> {
    const participants = await Promise.all(
      scheduleRoomDto.userIds.map((userId) =>
        this.participantService.findOrCreateParticipant(userId),
      ),
    );

    const room = new Room();
    room.participants = participants;
    room.status = 'not-started';
    room.startTime = new Date(scheduleRoomDto.startTime);
    room.endTime = new Date(scheduleRoomDto.endTime);
    room.roomId = nanoid(10);

    return await this.roomRepository.save(room);
  }

  // not used (since moving to Ad Hoc rooms)
  async findRoomById(roomId: string): Promise<Room> {
    return await this.roomRepository.findOneBy({ roomId });
  }

  // not used (since moving to Ad Hoc rooms)
  async updateRoomWithTwilioData(roomId: string, room: RoomInstance) {
    const roomInDb = await this.findRoomById(roomId);
    roomInDb.roomSid = room.sid;
    roomInDb.roomLink = room.url;
    await this.roomRepository.save(roomInDb);
  }

  // not used (since moving to Ad Hoc rooms)
  async createGroupRoom(roomId: string): Promise<RoomInstance> {
    const room = await this.twilioService.findOrCreateRoom({
      uniqueName: roomId,
      type: 'group',
      emptyRoomTimeout: 5,
      unusedRoomTimeout: 10,
      statusCallback: 'http://localhost:3000/rooms/status',
    });
    return room;
  }

  // not used
  async getActiveRooms(): Promise<RoomInstance[]> {
    return await this.twilioService.getActiveRooms();
  }
}
