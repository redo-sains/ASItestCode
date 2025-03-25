// src/controllers/clientController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import { createClient } from 'redis';

const prisma = new PrismaClient();

const redisClient = createClient();

AWS.config.update({
  accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY',
  region: 'YOUR_S3_BUCKET_REGION',  // e.g., 'us-east-1'
});

const s3 = new AWS.S3();

export const createdClient = async (req: Request, res: Response) => {
  try {
    const file = req.file;    

    const { name, slug, isProject, selfCapture, clientPrefix, address, phoneNumber, city } = req.body;

    if (!req.file) {
      return res.status(400).send({ message: 'Tidak ada gambar di upload!!!' });
    }
    
    const params = {
      Bucket: 'nama bucket',  
      Key: `images/${Date.now()}_${file.originalname}`,  
      Body: file.buffer,  
      ContentType: file.mimetype,  
      ACL: 'public-read',  
    };
  
    // Upload to S3
    s3.upload(params, async (err, data) => {
      if (err) {
        console.log('Error saat upload gambar:', err);
        return res.status(500).send({ message: 'Error saat upload gambar' });
      }

      const client = await prisma.client.create({
        data: {
          name,
          slug,
          isProject,
          selfCapture,
          clientPrefix,
          clientLogo: data.Location,
          address,
          phoneNumber,
          city
        }
      });
  
      
      await redisClient.connect();
  
      await redisClient.hSet(slug, {
        name,
        slug,
        isProject,
        selfCapture,
        clientPrefix,
        clientLogo: data.Location,
        address,
        phoneNumber,
        city
      })
        
      res.status(201).json({
        name,
        slug,
        isProject,
        selfCapture,
        clientPrefix,
        clientLogo: data.Location,
        address,
        phoneNumber,
        city
      });      
    });

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ada error!!' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany();
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ada error!!' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) }
    });

    if (!client) {
      return res.status(404).json({ message: 'data Client tidak ditemukan' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ada Error' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    const { id } = req.params;
    const { name, slug, isProject, selfCapture, clientPrefix, clientLogo, address, phoneNumber, city } = req.body;

    const params = {
      Bucket: 'nama bucket',  
      Key: `images/${Date.now()}_${file.originalname}`,  
      Body: file.buffer,  
      ContentType: file.mimetype,  
      ACL: 'public-read',  
    };
  
    // Upload to S3
    s3.upload(params, async (err, data) => {
      if (err) {
        console.log('Error saat upload gambar:', err);
        return res.status(500).send({ message: 'Error saat upload gambar' });
      }
    
      const client = await prisma.client.update({
        where: { id: parseInt(id) },
        data: {
          name,
          slug,
          isProject,
          selfCapture,
          clientPrefix,
          clientLogo: data.Location,
          address,
          phoneNumber,
          city
        }
      });
  
      
      
    await redisClient.connect();

    await redisClient.del(slug);

  
      await redisClient.hSet(slug, {
        name,
        slug,
        isProject,
        selfCapture,
        clientPrefix,
        clientLogo: data.Location,
        address,
        phoneNumber,
        city
      })
        
      res.status(201).json({
        name,
        slug,
        isProject,
        selfCapture,
        clientPrefix,
        clientLogo: data.Location,
        address,
        phoneNumber,
        city
      });      
    });

  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ada Error!!' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dataClient = await prisma.client.findUnique({
      where: { id: parseInt(id) }
    });

    await redisClient.del(dataClient.slug);

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        updatedAt : new Date()        
      }
    });


    res.status(200).json({ message: 'Data Client berhasil dihapus', client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ada Error!!' });
  }
};
