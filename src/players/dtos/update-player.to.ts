import { IsNotEmpty } from 'class-validator';

export class UpdatePlayerDTO {
  @IsNotEmpty()
  readonly celphone: string;

  @IsNotEmpty()
  readonly name: string;
}
