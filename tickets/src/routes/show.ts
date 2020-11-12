import express, { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import { BadRequestError } from '@gabrielkim13-ticketing/common';

import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new BadRequestError('Ticket ID is not valid');

  const ticket = await Ticket.findById(id);

  if (!ticket) return res.status(404).send();

  res.send(ticket);
});

export { router as showRouter };
