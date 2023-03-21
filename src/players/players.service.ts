import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDTO } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdatePlayerDTO } from './dtos/update-player.to';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);

  async createPlayer(createPlayerDTO: CreatePlayerDTO): Promise<Player> {
    const { email } = createPlayerDTO;

    const findPlayer = await this.playerModel.findOne({ email }).exec();

    if (findPlayer) {
      throw new BadRequestException(
        `Jogador com o e-mail: ${email} já cadastrado`,
      );
    }
    const createPlayer = new this.playerModel(createPlayerDTO);
    return await createPlayer.save();
  }

  async updatePlayer(
    _id: string,
    updatePlayerDTO: UpdatePlayerDTO,
  ): Promise<void> {
    const findPlayer = await this.playerModel.findOne({ _id }).exec();

    if (!findPlayer) {
      throw new NotFoundException(`Jogador com o id: ${_id} não encontrado`);
    }
    await this.playerModel.findOneAndUpdate({ _id }, { $set: updatePlayerDTO });
  }

  async getPlayers(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }

  async getPlayerByID(_id: string): Promise<Player> {
    const player = await this.playerModel.findById({ _id });
    if (!player) {
      throw new NotFoundException(`Jogador com o id: ${_id} não encontrado`);
    }
    return player;
  }

  async deletePlayer(_id: string): Promise<any> {
    const player = await this.playerModel.findById({ _id });
    if (!player) {
      throw new NotFoundException(`Jogador com o id: ${_id} não encontrado`);
    }
    return await this.playerModel.deleteOne({ _id });
  }
}
