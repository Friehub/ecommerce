import { FastifyInstance } from 'fastify';
import { uploadManager } from '@ecom/api'; // I'll check if it's exported
import multipart from '@fastify/multipart';

export async function uploadRoutes(server: FastifyInstance) {
  await server.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    }
  });

  server.post('/api/media/upload', async (req, reply) => {
    // 1. Authenticate (Simplistic check for demo, should use session)
    // In production, we'd use req.user from a hook
    
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: 'NO_FILE_UPLOADED' });
    }

    try {
      const result = await uploadManager.processUpload({
        buffer: await data.toBuffer(),
        mimetype: data.mimetype,
        size: 0, // Manager will check buffer size if we pass it, or we use multipart limit
        originalname: data.filename
      });

      return reply.send(result);
    } catch (error: any) {
      server.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });
}
