export class CreateLeadDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  companyName!: string;
  industry!: string;
  source?: string;
  estimatedValue?: number;
}
