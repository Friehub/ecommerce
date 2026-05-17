import { prisma } from '@ecom/db';

export const supportService = {
  findUniqueTicket: prisma.supportTicket.findUnique,
  findFirstTicket: prisma.supportTicket.findFirst,
  findManyTickets: prisma.supportTicket.findMany,
  createTicket: prisma.supportTicket.create,
  updateTicket: prisma.supportTicket.update,
  deleteTicket: prisma.supportTicket.delete,

  findManyMessages: prisma.supportMessage.findMany,
  createMessage: prisma.supportMessage.create,

  async getOrCreateActiveTicket(userId: string) {
    let ticket = await prisma.supportTicket.findFirst({
      where: {
        userId,
        status: { in: ['OPEN', 'IN_PROGRESS'] }
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId,
          subject: 'General Support',
          status: 'OPEN',
          messages: {
            create: {
              senderId: 'system',
              senderRole: 'SYSTEM',
              content: 'Hello! I am your Jumia virtual assistant. How can I assist you with your order today?'
            }
          }
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } }
        }
      });
    }

    return ticket;
  },

  async getTicketMessages(ticketId: string, userId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) throw new Error('TICKET_NOT_FOUND');
    if (ticket.userId !== userId) throw new Error('UNAUTHORIZED');

    return prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' }
    });
  },

  async sendSupportMessage(ticketId: string, userId: string, content: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: true
      }
    });

    if (!ticket) throw new Error('TICKET_NOT_FOUND');
    if (ticket.userId !== userId) throw new Error('UNAUTHORIZED');

    const userMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderRole: 'USER',
        content
      }
    });

    const userMessageCount = ticket.messages.filter(m => m.senderRole === 'USER').length;

    if (userMessageCount === 0) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: 'system',
          senderRole: 'SYSTEM',
          content: 'THANK YOU FOR REACHING OUT. A HUMAN RESOLUTIONS SPECIALIST IS CONNECTING TO YOUR SECURE SESSION.'
        }
      });
    }

    return userMessage;
  }
};
