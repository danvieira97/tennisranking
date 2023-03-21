import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePlayerDTO {
  @IsNotEmpty()
  readonly celphone: string;
  @IsEmail()
  readonly email: string;
  @IsNotEmpty()
  readonly name: string;
}
