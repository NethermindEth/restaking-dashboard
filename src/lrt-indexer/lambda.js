import app from './app.js';
import awsLambdaFastify from '@fastify/aws-lambda';
import Fastify from 'fastify';

const fastify = new Fastify({ logger: true });

app(fastify);

export const handler = awsLambdaFastify(fastify);

await fastify.ready(); // needs to be placed after awsLambdaFastify call because of the decoration: https://github.com/fastify/aws-lambda-fastify/blob/master/index.js#L9
