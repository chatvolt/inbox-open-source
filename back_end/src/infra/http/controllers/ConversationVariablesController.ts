import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const conversationVariableSchema = z.object({
  conversationId: z.string().min(1, { message: 'Conversation ID is required' }),
  varName: z.string().min(1, { message: 'Variable name is required' }),
  varValue: z.string().min(1, { message: 'Variable value is required' }),
});

const conversationVariableParamsSchema = z.object({
  conversationId: z.string().min(1, { message: 'Conversation ID is required' }),
});

const variableParamsSchema = z.object({
  conversationId: z.string().min(1, { message: 'Conversation ID is required' }),
  varName: z.string().min(1, { message: 'Variable name is required' }),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

const conversationVariableResponseSchema = z.object({
  conversationId: z.string(),
  varName: z.string(),
  varValue: z.string(),
});

const deleteResponseSchema = z.object({
  message: z.string(),
  deleted: conversationVariableResponseSchema,
});

export const conversationVariablesRoute: FastifyPluginAsyncZod = async (server) => {
  // Criar uma nova variável customizada para uma conversa
  server.post('/variables', {
    schema: {
      tags: ['conversation-variables'],
      summary: 'Create a new custom variable for a conversation',
      body: conversationVariableSchema,
      response: {
        200: conversationVariableResponseSchema,
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    if (!process.env.API_KEY) {
      console.error('API_KEY is not defined in environment variables');
      return reply.status(500).send({ error: 'API key is missing' });
    }

    const { conversationId, varName, varValue } = request.body;

    const targetUrl = 'http://localhost:3001/variables';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        varName,
        varValue,
      }),
    };

    try {
      const apiResponse = await fetch(targetUrl, options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to create conversation variable' });
      }

      const data = await apiResponse.json();
      return reply.status(200).send(data);
    } catch (error) {
      console.error('Error creating conversation variable:', error);
      return reply.status(500).send({ error: 'Failed to create conversation variable' });
    }
  });

  // Listar todas as variáveis customizadas de uma conversa
  server.get('/variables/:conversationId', {
    schema: {
      tags: ['conversation-variables'],
      summary: 'List all custom variables for a conversation',
      params: conversationVariableParamsSchema,
      response: {
        200: z.array(conversationVariableResponseSchema),
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    const { conversationId } = request.params;

    const targetUrl = `http://localhost:3001/variables/${conversationId}`;

    const options = {
      method: 'GET',
    };

    try {
      const apiResponse = await fetch(targetUrl, options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to fetch conversation variables' });
      }

      const data = await apiResponse.json();
      return reply.status(200).send(data);
    } catch (error) {
      console.error('Error fetching conversation variables:', error);
      return reply.status(500).send({ error: 'Failed to fetch conversation variables' });
    }
  });

  // Obter o valor de uma variável customizada específica de uma conversa
  server.get('/variables/:conversationId/:varName', {
    schema: {
      tags: ['conversation-variables'],
      summary: 'Get a specific custom variable value for a conversation',
      params: variableParamsSchema,
      response: {
        200: conversationVariableResponseSchema,
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    const { conversationId, varName } = request.params;

    const targetUrl = `http://localhost:3001/variables/${conversationId}/${varName}`;

    const options = {
      method: 'GET',
    };

    try {
      const apiResponse = await fetch(targetUrl, options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to fetch conversation variable' });
      }

      const data = await apiResponse.json();
      return reply.status(200).send(data);
    } catch (error) {
      console.error('Error fetching conversation variable:', error);
      return reply.status(500).send({ error: 'Failed to fetch conversation variable' });
    }
  });

  // Deletar uma variável customizada de uma conversa
  server.delete('/variables/:conversationId/:varName', {
    schema: {
      tags: ['conversation-variables'],
      summary: 'Delete a custom variable from a conversation',
      params: variableParamsSchema,
      response: {
        200: deleteResponseSchema,
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    const { conversationId, varName } = request.params;

    const targetUrl = `http://localhost:3001/variables/${conversationId}/${varName}`;

    const options = {
      method: 'DELETE',
    };

    try {
      const apiResponse = await fetch(targetUrl, options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to delete conversation variable' });
      }

      const data = await apiResponse.json();
      return reply.status(200).send(data);
    } catch (error) {
      console.error('Error deleting conversation variable:', error);
      return reply.status(500).send({ error: 'Failed to delete conversation variable' });
    }
  });
};