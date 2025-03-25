import { Router } from 'express';
import { createdClient, getClients, getClient, updateClient, deleteClient } from '../controllers/clientController';
const AWS = require('aws-sdk');
const multer = require('multer');

export const ClientRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

ClientRouter.post('/', upload.single('clientLogo'), createdClient);
ClientRouter.get('/',  getClients);
ClientRouter.get('/:id', getClient);
ClientRouter.put('/:id', upload.single('clientLogo'), updateClient);
ClientRouter.delete('/:id', deleteClient);