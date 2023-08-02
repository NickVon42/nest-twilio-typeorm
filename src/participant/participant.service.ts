import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Participant } from './participant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/room/room.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async findParticipantForRoom(
    participantId: string,
    room: Room,
  ): Promise<Participant> {
    return await this.participantRepository.findOneBy({ participantId, room });
  }

  async findOrCreateParticipant(participantId: string): Promise<Participant> {
    const existingParticipant = await this.participantRepository.findOneBy({
      participantId,
    });
    if (existingParticipant) {
      return existingParticipant;
    }
    return await this.participantRepository.save({ participantId });
  }
}
