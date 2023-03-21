import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dtos/create-category.dto';
import { UpdateCategoryDTO } from './dtos/update-cateogry.dto';
import { Category } from './interfaces/category.interface';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createCategory(
    @Body() createCategoryDTO: CreateCategoryDTO,
  ): Promise<Category> {
    return await this.categoriesService.createCategory(createCategoryDTO);
  }

  @Get()
  async getCategories(
    @Query() params: string[],
  ): Promise<Category[] | Category> {
    const idCategory = params['idCategory'];
    const idPlayer = params['idPlayer'];

    if (idCategory) {
      return await this.categoriesService.getCategoryByID(idCategory);
    }

    if (idPlayer) {
      return await this.categoriesService.getCategoryPlayer(idPlayer);
    }

    return await this.categoriesService.getCategories();
  }

  // @Get('/:category')
  // async getCategoryByID(
  //   @Param('category') category: string,
  // ): Promise<Category> {
  //   return await this.categoriesService.getCategoryByID(category);
  // }

  @Put('/:category')
  @UsePipes(ValidationPipe)
  async updateCategory(
    @Body() updateCategoryDTO: UpdateCategoryDTO,
    @Param('category') category: string,
  ): Promise<void> {
    await this.categoriesService.updateCategory(category, updateCategoryDTO);
  }

  @Post('/:category/players/:idPlayer')
  async postPlayerCategory(@Param() params: string[]): Promise<void> {
    await this.categoriesService.postPlayerCategory(params);
  }
}
