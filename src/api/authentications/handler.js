class AuthenticationsHandlers {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler({ payload }, h) {
    this._validator.validatePostAuthenticationPayload(payload);
    const id = await this._usersService.verifyUserCredential(payload);
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
    await this._authenticationsService.addToken({ token: refreshToken });
    const response = h.response({
      status: 'success',
      data: {
        accessToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler({ payload }, h) {
    this._validator.validationPutAuthenticationPayload(payload);
    await this._authenticationsService.verifyRefreshToken(payload);
    const { id } = this._tokenManager.verifyRefreshToken(payload.refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ id });
    return h.response({
      status: 'success',
      message: 'access token been updated!',
      data: {
        accessToken,
      },
    });
  }

  async deleteAuthenticationHandler({ payload }, h) {
    this._validator.validationDeleteAuthenticationPayload(payload);
    Promise.all(
      await this._authenticationsService.verifyRefreshToken(payload),
      await this._authenticationsService.deleteRefreshToken(payload),
    );
    return h.response({
      status: 'succecss',
      message: 'refresh token been deleted!',
    });
  }
}

module.exports = AuthenticationsHandlers;
