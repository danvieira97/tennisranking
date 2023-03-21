import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { CreateCategoryDTO } from './dtos/create-category.dto';
import { UpdateCategoryDTO } from './dtos/update-cateogry.dto';
import { Category } from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    private readonly playersService: PlayersService,
  ) {}

  async createCategory(
    createCategoryDTO: CreateCategoryDTO,
  ): Promise<Category> {
    const { category } = createCategoryDTO;

    const findCategory = await this.categoryModel.findOne({ category });
    if (findCategory) {
      throw new BadRequestException(`Categoria ${category} já cadastrada!`);
    }

    const createCategory = new this.categoryModel(createCategoryDTO);
    return await createCategory.save();
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoryModel.find().populate('players');
  }

  async getCategoryPlayer(idPlayer: any): Promise<Category> {
    const players = await this.playersService.getPlayers();

    const filterPlayer = players.filter((player) => player._id === idPlayer);

    if (filterPlayer.length == 0) {
      throw new BadRequestException(`O id ${idPlayer} não é um jogador!`);
    }

    return await this.categoryModel.findOne().where('jogadores').in(idPlayer);
  }

  async getCategoryByID(category: string): Promise<Category> {
    const findCategory = await this.categoryModel.findOne({ category });

    if (!findCategory) {
      throw new NotFoundException(`Categoria ${category} não encontrada`);
    }

    return findCategory;
  }

  async updateCategory(
    category: string,
    updateCategoryDTO: UpdateCategoryDTO,
  ): Promise<void> {
    const findCategory = await this.categoryModel.findOne({ category });
    if (!findCategory) {
      throw new NotFoundException(`Categoria ${category} não econtrada`);
    }

    await this.categoryModel.findOneAndUpdate(
      { category },
      { $set: updateCategoryDTO },
    );
  }

  async postPlayerCategory(params: string[]): Promise<void> {
    const category = params['category'];
    const idPlayer = params['idPlayer'];

    const findCategory = await this.categoryModel.findOne({ category });
    if (!findCategory) {
      throw new NotFoundException(`Categoria ${category} não cadastrada!`);
    }

    const playerAlredyPostedCategory = await this.categoryModel
      .find({ category })
      .where('players')
      .in(idPlayer);
    if (playerAlredyPostedCategory.length > 0) {
      throw new BadRequestException(
        `Jogador ${idPlayer} já cadastrado na categoria ${category}`,
      );
    }

    await this.playersService.getPlayerByID(idPlayer);

    findCategory.players.push(idPlayer);
    await this.categoryModel.findOneAndUpdate(
      { category },
      { $set: findCategory },
    );
  }
}
