require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const authentications = require('./api/authentications');
const users = require('./api/users');
const ClientError = require('./exceptions/ClientError');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const UsersService = require('./services/postgres/UsersService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const UsersValidator = require('./validator/users');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });
  await server.register([{ plugin: Jwt }]);
  server.auth.strategy('authentication_jwt', 'jwt', {
    keys: process.env.ACCESS_KEY_TOKEN,
    verify: {
      aud: false,
      iss: false,
      sub: false,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.route({
    method: 'GET',
    path: '/home',
    handler: async () => 'hello that is authorization',
    options: {
      auth: 'authentication_jwt',
    },
  });

  await server.register([
    {
      plugin: users,
      options: {
        usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', ({ response }, h) => {
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newReponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newReponse.code(response.statusCode);
        return newReponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newReponse = h.response({
        status: 'error',
        message: 'server error',
      });
      newReponse.code(500);
      return newReponse;
    }
    return h.continue;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`server runing at ${server.info.uri}`);
};

init();
