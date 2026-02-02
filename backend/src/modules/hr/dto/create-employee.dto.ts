import { IsString, IsEmail } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  department!: string;

  @IsString()
  jobTitle!: string;

  @IsString()
  hireDate!: string;

  @IsString()
  salary!: string;

  @IsString()
  status!: string;
}
