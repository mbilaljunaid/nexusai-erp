export class CreateLeadDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  companyName!: string;
  company?: string;
  industry!: string;
  source?: string;
  estimatedValue?: number;
}
