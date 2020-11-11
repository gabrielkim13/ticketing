import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { Password } from '../services/password';

import { validateRequest, BadRequestError } from '@gabrielkim13-ticketing/common';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail().withMessage('E-mail must be valid'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password not informed'),
],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) throw new BadRequestError('Invalid credentials');

    const isPasswordMatch = await Password.compare(existingUser.password, password);

    if (!isPasswordMatch) throw new BadRequestError('Invalid credentials');

    const token = jwt.sign({
      id: existingUser.id,
      email: existingUser.email,
    }, process.env.JWT_KEY!);

    req.session = { jwt: token };

    return res.status(200).send(existingUser);
  });

export { router as signinRouter };
