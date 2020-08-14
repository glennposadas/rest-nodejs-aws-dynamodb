/* ==========================================================================
   Dependencies
   ========================================================================== */

  const joi = require('joi');
  const httpStatus = require('http-status-codes');
  const { RESPONSE_MESSAGES } = require('../constants');
  const responseHelper = require('../helpers/responseHelper');
  const authService = require('../services/authService');

  require('dotenv').config();

  /* ==========================================================================
    Public Functions
    ========================================================================== */

  const register = async (req, res) => {
    try {
      const { body } = req;

      const schema = joi.object({
        email: joi
          .string()
          .required()
          .email(),
        password: joi.string().required(),
        fullname: joi.string().required(),
      });

      const { error } = schema.validate(body);

      if (error && error.details) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(responseHelper.BAD_REQUEST(error.details[0].message));
      }

      const registerData = await authService.register(body.email, body.password, body.fullname);

      if (registerData) {
        return res
          .status(httpStatus.OK)
          .json(
            responseHelper.SUCCESS(RESPONSE_MESSAGES.LOGIN_SUCCESSFUL, registerData)
          );
      }

      console.log("Error auth controller, bad reqeuest, invalid credentials, ", error)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(responseHelper.BAD_REQUEST(RESPONSE_MESSAGES.INVALID_CREDENTIALS));
    } catch (err) {
      console.log("Error auth controller: ", err)

      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };

  const login = async (req, res) => {
    console.log("login controller...")
    try {
      const { body } = req;

      const schema = joi.object({
        email: joi
          .string()
          .required()
          .email(),
        password: joi.string().required()
      });

      const { error } = schema.validate(body);

      if (error && error.details) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(responseHelper.BAD_REQUEST(error.details[0].message));
      }

      const loginData = await authService.login(body.email, body.password);

      if (loginData) {
        return res
          .status(httpStatus.OK)
          .json(
            responseHelper.SUCCESS(RESPONSE_MESSAGES.LOGIN_SUCCESSFUL, loginData)
          );
      }
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(responseHelper.BAD_REQUEST(RESPONSE_MESSAGES.INVALID_CREDENTIALS));
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };

  const logout = async (req, res) => {
    try {
      const { body } = req;

      const schema = joi.object({
        refreshToken: joi.string().required()
      });

      const { error } = schema.validate(body);

      if (error && error.details) {
        throw new Error('Invalid Request');
      }

      await authService.logout(body.refreshToken);

      return res
        .status(httpStatus.OK)
        .json(responseHelper.SUCCESS(RESPONSE_MESSAGES.LOGOUT_SUCCESSFUL));
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };

  const refreshToken = async (req, res) => {
    try {
      const { body } = req;

      const schema = joi.object({
        refreshToken: joi.string().required()
      });

      const { error } = schema.validate(body);

      if (error && error.details) {
        throw new Error('Invalid Request');
      }

      const token = await authService.refreshToken(body.refreshToken);

      return res
        .status(httpStatus.OK)
        .json(
          responseHelper.SUCCESS(RESPONSE_MESSAGES.LOGIN_SUCCESSFUL, { token })
        );
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };

  /* ==========================================================================
    Exports
    ========================================================================== */

  module.exports = {
    register,
    login,
    logout,
    refreshToken
  };
