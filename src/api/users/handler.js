class UsersHandlers {
  constructor(usersService, validator) {
    this._usersService = usersService;
    this._validator = validator;
    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler({ payload }, h) {
    this._validator.validateUserPayload(payload);
    const user = await this._usersService.addUser(payload);
    const response = h.response({
      status: 'success',
      data: {
        user,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandlers;
