import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChallengeStatusValidationPipe } from 'src/common/pipes/challenge-status-validation.pipe';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDTO } from './dtos/create-challenge.dto';
import { PostChallengeMatchDTO } from './dtos/post-challenge-match.dto';
import { UpdateChallengeDTO } from './dtos/update-challenge.dto';
import { Challenge } from './interfaces/challenge.interface';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private readonly challengeService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(
    @Body() createChallengeDTO: CreateChallengeDTO,
  ): Promise<Challenge> {
    this.logger.log(`createCategoryDTO: ${JSON.stringify(createChallengeDTO)}`);
    return await this.challengeService.createChallenge(createChallengeDTO);
  }

  @Get()
  async getChallenges(@Query('idPlayer') _id: string): Promise<Challenge[]> {
    return _id
      ? await this.challengeService.getPlayerChallenges(_id)
      : await this.challengeService.getAllChallenges();
  }

  @Put('/:challenge')
  async updateChallenge(
    @Body(ChallengeStatusValidationPipe) updateChallengeDTO: UpdateChallengeDTO,
    @Param('challenge') _id: string,
  ): Promise<void> {
    await this.challengeService.updateChallenge(_id, updateChallengeDTO);
  }

  @Post('/:challenge/match')
  async postChallengeMatch(
    @Body(ValidationPipe) postChallengeMatchDTO: PostChallengeMatchDTO,
    @Param('challenge') _id: string,
  ): Promise<void> {
    return await this.challengeService.postChallengeMatch(
      _id,
      postChallengeMatchDTO,
    );
  }

  @Delete('/:_id')
  async deleteChallenge(@Param('_id') _id: string): Promise<void> {
    return await this.challengeService.deleteChallenge(_id);
  }
}
