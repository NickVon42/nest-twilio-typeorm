import { ArrayMinSize, IsArray, IsString, IsDateString } from 'class-validator';

export class ScheduleRoomDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  userIds: string[];

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
