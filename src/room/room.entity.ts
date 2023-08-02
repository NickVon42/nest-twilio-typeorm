import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoomRoomStatus } from 'twilio/lib/rest/video/v1/room';
import { Participant } from '../participant/participant.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  roomId: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['not-started', 'in-progress', 'completed', 'failed', 'cancelled'],
    default: 'not-started',
  })
  status: 'not-started' | RoomRoomStatus;

  @Column({ nullable: true })
  roomSid: string;

  @Column({ nullable: true })
  roomLink: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @OneToMany('Participant', 'room')
  participants: Participant[];
}
