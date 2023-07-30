import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RoomRoomStatus } from 'twilio/lib/rest/video/v1/room';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { array: true })
  participants: string[];

  @Column({
    type: 'enum',
    enum: ['not-started', 'in-progress', 'completed', 'failed'],
    default: 'not-started',
  })
  status: 'not-started' | RoomRoomStatus;

  @Column({ nullable: true })
  room_sid: string;

  @Column({ nullable: true })
  room_link: string;

  @Column({ type: 'timestamptz' })
  scheduled_at: Date;
}
