import { IsString, IsEmail } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  subject!: string;

  @IsString()
  description!: string;

  @IsString()
  priority!: string;

  @IsString()
  category!: string;

  @IsEmail()
  customerEmail!: string;
}
