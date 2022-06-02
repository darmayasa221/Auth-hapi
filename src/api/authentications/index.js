const AuthenticationsHandlers = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server, {
    authenticationsService, usersService, tokenManager, validator,
  }) => {
    const authenticationsHandlers = new AuthenticationsHandlers(
      authenticationsService,
      usersService,
      tokenManager,
      validator,
    );
    server.route(routes(authenticationsHandlers));
  },
};
