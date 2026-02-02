import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  private tickets: Ticket[] = [];
  private idCounter = 1;

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.idCounter++,
      ...createTicketDto,
      createdAt: new Date(),
    };
    this.tickets.push(ticket);
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.tickets;
  }

  async findOne(id: string): Promise<Ticket | null> {
    return this.tickets.find(t => t.id === parseInt(id)) || null;
  }

  async update(id: string, updateTicketDto: Partial<CreateTicketDto>): Promise<Ticket | null> {
    const ticket = this.tickets.find(t => t.id === parseInt(id));
    if (!ticket) return null;
    Object.assign(ticket, updateTicketDto);
    return ticket;
  }

  async remove(id: string): Promise<void> {
    const index = this.tickets.findIndex(t => t.id === parseInt(id));
    if (index > -1) this.tickets.splice(index, 1);
  }
}
