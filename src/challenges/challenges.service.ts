import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { PlayersService } from 'src/players/players.service';
import { CreateChallengeDTO } from './dtos/create-challenge.dto';
import { PostChallengeMatchDTO } from './dtos/post-challenge-match.dto';
import { UpdateChallengeDTO } from './dtos/update-challenge.dto';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { Challenge, Match } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
    private readonly playersService: PlayersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createChallenge(
    createChallengeDTO: CreateChallengeDTO,
  ): Promise<Challenge> {
    /* Check if the players exists */
    const players = await this.playersService.getPlayers();

    createChallengeDTO.players.map((playerDTO) => {
      const playerFilter = players.filter(
        (player) => player._id == playerDTO._id,
      );
      if (playerFilter.length == 0) {
        throw new BadRequestException(`O id ${playerDTO._id} não é um jogador`);
      }
    });

    /* Check if the inviter is a player in the match */
    const inviterIsPlayer = await createChallengeDTO.players.filter(
      (player) => player._id == createChallengeDTO.inviter,
    );

    if (inviterIsPlayer.length == 0) {
      throw new BadRequestException(
        `O solicitante dever ser um jogador da partida`,
      );
    }

    /* Get the category by Player inviter ID */
    const playerCategory = await this.categoriesService.getCategoryPlayer(
      createChallengeDTO.inviter,
    );
    if (!playerCategory) {
      throw new BadRequestException(
        `O solicitante precisa estar registrado em uma categoria`,
      );
    }

    const createChallenge = new this.challengeModel(createChallengeDTO);
    createChallenge.category = playerCategory.category;
    createChallenge.dateTimeInvite = new Date();
    createChallenge.status = ChallengeStatus.PENDENTE;

    return await createChallenge.save();
  }

  async getPlayerChallenges(_id: any): Promise<Challenge[]> {
    const player = await this.playersService.getPlayerByID(_id);
    if (!player) {
      throw new BadRequestException(`O ID: ${_id}} não é um jogador`);
    }

    return await this.challengeModel
      .find()
      .where('players')
      .in(_id)
      .populate('inviter')
      .populate('players')
      .populate('match');
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return await this.challengeModel
      .find()
      .populate('inviter')
      .populate('players')
      .populate('match');
  }

  async updateChallenge(
    _id: string,
    updateChallengeDTO: UpdateChallengeDTO,
  ): Promise<void> {
    const findChallenge = await this.challengeModel.findById(_id);

    if (!findChallenge) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado`);
    }

    /* Update reply date when challenge status is alright */
    if (updateChallengeDTO.status) {
      findChallenge.dateTimeReply = new Date();
    }
    findChallenge.status = updateChallengeDTO.status;
    findChallenge.dateTimeChallenge = updateChallengeDTO.dateTimeChallenge;

    await this.challengeModel.findOneAndUpdate(
      { _id },
      { $set: findChallenge },
    );
  }

  async postChallengeMatch(
    _id: string,
    postChallengeMatchDTO: PostChallengeMatchDTO,
  ): Promise<void> {
    const findChallenge = await this.challengeModel.findById(_id);
    if (!findChallenge) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado`);
    }

    /* Check if the winning player is in the match */
    const playerFilter = findChallenge.players.filter(
      (player) => player._id === postChallengeMatchDTO.def,
    );
    if (playerFilter.length === 0) {
      throw new BadRequestException(
        `O jogador vencedor não faz parte da partida`,
      );
    }

    const createMatch = new this.matchModel(postChallengeMatchDTO);
    createMatch.category = findChallenge.category;
    createMatch.players = findChallenge.players;

    const result = await createMatch.save();

    findChallenge.status = ChallengeStatus.REALIZADO;
    findChallenge.match = result._id;

    try {
      await this.challengeModel.findOneAndUpdate(
        { _id },
        { $set: findChallenge },
      );
    } catch (error) {
      await this.matchModel.deleteOne({ _id: result._id });
      throw new InternalServerErrorException();
    }
  }

  async deleteChallenge(_id: string): Promise<void> {
    const findChallenge = await this.challengeModel.findById(_id);
    if (!findChallenge) {
      throw new NotFoundException(`Desafio ${_id} não cadastrado`);
    }

    findChallenge.status = ChallengeStatus.CANCELADO;
    await this.challengeModel.findOneAndUpdate(
      { _id },
      { $set: findChallenge },
    );
  }
}
