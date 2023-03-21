import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePlayerDTO } from './dtos/create-player.dto';
import { Player } from './interfaces/player.interface';
import { PlayersService } from './players.service';
import { ValidationParamsPipe } from '../common/pipes/validation-params.pipe';
import { UpdatePlayerDTO } from './dtos/update-player.to';

@Controller('api/v1/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createPlayer(
    @Body() createPlayerDTO: CreatePlayerDTO,
  ): Promise<Player> {
    return await this.playersService.createPlayer(createPlayerDTO);
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDTO: UpdatePlayerDTO,
    @Param('_id', ValidationParamsPipe) _id: string,
  ): Promise<void> {
    await this.playersService.updatePlayer(_id, updatePlayerDTO);
  }

  @Get()
  async getPlayers(): Promise<Player[]> {
    return this.playersService.getPlayers();
  }

  @Get('/:_id')
  async getPlayerByID(
    @Param('_id', ValidationParamsPipe) _id: string,
  ): Promise<Player> {
    return this.playersService.getPlayerByID(_id);
  }

  @Delete('/:_id')
  async deletePlayer(
    @Param('_id', ValidationParamsPipe) _id: string,
  ): Promise<void> {
    return this.playersService.deletePlayer(_id);
  }
}
