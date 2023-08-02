import { Twilio, jwt } from 'twilio';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RoomInstance,
  RoomListInstanceCreateOptions,
} from 'twilio/lib/rest/video/v1/room';

@Injectable()
export class TwilioService {
  private client: Twilio;
  private twilioAccountSid: string;
  private twilioApiKey: string;
  private twilioApiSecret: string;

  constructor(private configService: ConfigService) {
    this.client = this.getTwilioClient();
  }

  /**
   * @throws Error if Twilio config variables are missing
   */
  private getTwilioClient() {
    this.twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioApiKey = this.configService.get<string>('TWILIO_API_KEY_SID');
    this.twilioApiSecret = this.configService.get<string>(
      'TWILIO_API_KEY_SECRET',
    );

    if (!this.twilioAccountSid || !this.twilioApiKey || !this.twilioApiSecret) {
      throw new Error('Some Twilio config variables are missing');
    }
    return new Twilio(this.twilioApiKey, this.twilioApiSecret, {
      accountSid: this.twilioAccountSid,
    });
  }

  /**
   * @throws Error if the room cannot be created
   */
  async findOrCreateRoom(
    options: Omit<RoomListInstanceCreateOptions, 'uniqueName' | 'type'> &
      Required<Pick<RoomListInstanceCreateOptions, 'uniqueName' | 'type'>>,
  ): Promise<RoomInstance> {
    try {
      return await this.client.video.v1.rooms(options.uniqueName).fetch();
    } catch (error) {
      // the room was not found, so create it
      if (error.code == 20404) {
        return await this.client.video.v1.rooms.create(options);
      }
      throw error;
    }
  }

  /**
   * @param identity - represents the user identity for this Access Token
   * */
  async createRoomGrant(roomName: string, identity: string): Promise<string> {
    const AccessToken = jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const videoGrant = new VideoGrant({
      room: roomName,
    });

    const token = new AccessToken(
      this.twilioAccountSid,
      this.twilioApiKey,
      this.twilioApiSecret,
      { identity: identity },
    );
    token.addGrant(videoGrant);

    return token.toJwt();
  }

  async getActiveRooms(): Promise<RoomInstance[]> {
    try {
      const rooms = await this.client.video.v1.rooms.list({
        status: 'in-progress',
        limit: 20,
      });

      return rooms;
    } catch (error) {
      throw error;
    }
  }
}
