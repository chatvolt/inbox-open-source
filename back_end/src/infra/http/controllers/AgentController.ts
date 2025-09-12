import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const errorResponseSchema = z.object({
  error: z.string(),
}).describe('Erro ao atualizar o webhook do agente');

const agentParamsSchema = z.object({
  agentId: z.string().min(1, { message: 'Agent ID is required' }),
});

const webhookQuerySchema = z.object({
  type: z.enum(['whatsapp', 'telegram', 'zapi', 'instagram'], {
    message: "Type must be one of 'whatsapp', 'telegram', 'zapi', 'instagram'"
  }),
  enabled: z.coerce.boolean(),
});

const successResponseSchema = z.string().describe('Webhook status updated successfully');

const agentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  modelName: z.string(),
  temperature: z.number(),
  visibility: z.enum(['public', 'private']),
  systemPrompt: z.string().nullable(),
  enableInactiveHours: z.boolean().nullable(),
  inactiveHours: z.record(z.string(), z.any()).nullable(),
  interfaceConfig: z.record(z.string(), z.any()),
  tools: z.array(z.record(z.string(), z.any())),
  organizationId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).describe('Agent details');

export const agentWebhookRoute: FastifyPluginAsyncZod = async (server) => {
  server.patch('/agents/:agentId/webhook', {
    schema: {
      tags: ['agents'],
      summary: 'Enable or disable an agent integration webhook',
      params: agentParamsSchema,
      querystring: webhookQuerySchema,
      response: {
        200: successResponseSchema,
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    if (!process.env.API_KEY) {
      console.error('API_KEY is not defined in environment variables');
      return reply.status(500).send({ error: 'API key is missing' });
    }

    const { agentId } = request.params;
    const { type, enabled } = request.query;

    const targetUrl = new URL(`https://api.chatvolt.ai/agents/${agentId}/webhook`);
    targetUrl.searchParams.append('type', type);
    targetUrl.searchParams.append('enabled', String(enabled));

    const options = {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
      }
    };

    try {
      const apiResponse = await fetch(targetUrl.toString(), options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to update agent webhook' });
      }
      const data = await apiResponse.text();
      return reply.status(200).send(data);
    } catch (error) {
      console.error('Error updating agent webhook:', error);
      return reply.status(500).send({ error: 'Failed to update agent webhook' });
    }
  });

  server.get('/agents/:agentId', {
    schema: {
      tags: ['agents'],
      summary: 'Get agent details by ID',
      params: agentParamsSchema,
      response: {
        200: agentResponseSchema,
        500: errorResponseSchema,
      }
    },
  }, async (request, reply) => {
    if (!process.env.API_KEY) {
      console.error('API_KEY is not defined in environment variables');
      return reply.status(500).send({ error: 'API key is missing' });
    }

    const { agentId } = request.params;

    const targetUrl = `https://api.chatvolt.ai/agents/${agentId}`;

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
      }
    };

    try {
      const apiResponse = await fetch(targetUrl, options);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Error from external API:', apiResponse.status, errorData);
        return reply.status(500).send({ error: 'Failed to fetch agent details' });
      }

      const data = await apiResponse.json();
      const validatedData = agentResponseSchema.parse(data);
      return reply.status(200).send(validatedData);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      return reply.status(500).send({ error: 'Failed to fetch agent details' });
    }
  });
};