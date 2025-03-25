// src/app.ts
import express from 'express';
import { ClientRouter } from './routes/clientRoutes';

const app = express();
const port = 8000;

app.use(express.json());

app.use('/api/clients', ClientRouter);


app.listen(port, () => {
  console.log(`Server jalan di link ini http://localhost:${port}`);
});