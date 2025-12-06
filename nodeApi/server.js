import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import connectDb from './config/dbConnection.js';
import contactsRouter from './routes/contactsRoutes.js';
import userRouter from './routes/userRoutes.js';

dotenv.config();
connectDb();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log('server running on port:', port);
});