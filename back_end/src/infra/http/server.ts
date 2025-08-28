import Fastify from 'fastify';
import cors from '@fastify/cors';
import scalarAPIReference from '@scalar/fastify-api-reference'
import { fastifySwagger } from '@fastify/swagger';
import 'dotenv/config'
import { assignConversationRoute, getConversationsRoute } from './controllers/ConversationController';
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { agentWebhookRoute } from './controllers/AgentController'; 


const server = Fastify();

// server.register(appRoutes,{prefix:'/api'});
if (process.env.NODE_ENV === 'development') {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Middleware API ChatVolt - Inbox',
        version: '1.0.0',
      }
    },
    transform: jsonSchemaTransform,
  })

  server.register(scalarAPIReference, {
    routePrefix: '/docs',
  })
}
server.register(cors);
server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(getConversationsRoute);
server.register(assignConversationRoute);
server.register(agentWebhookRoute);

export const app = server;