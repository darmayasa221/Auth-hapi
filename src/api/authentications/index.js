const AuthenticationsHandlers = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server, { authenticationsService, userServices, validator }) => {
    const authenticationsHandlers = new AuthenticationsHandlers(
      authenticationsService,
      userServices,
      validator,
    );
    server.route(routes(authenticationsHandlers));
  },
};
