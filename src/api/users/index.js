const routes = require('./routes');
const UsersHandlers = require('./handler');

module.exports = {
  name: 'users',
  register: async (server, { usersService, validator }) => {
    const usersHandlers = new UsersHandlers(usersService, validator);
    server.route(routes(usersHandlers));
  },
};
