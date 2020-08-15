/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const joi = require('joi');
   const notesService = require('../services/notesService');
   const { RESPONSE_MESSAGES } = require('../constants');
   const responseHelper = require('../helpers/responseHelper');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const getAllNotes = async (req, res) => {
     try {
       const users = await notesService.getAllNotes();
   
       return res.status(httpStatus.OK).json(responseHelper.SUCCESS(null, users));
     } catch (err) {
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   const createUser = async (req, res) => {
     console.log("createUser controller...")
     try {
       const { body } = req;
   
       const schema = joi.object({
         name: joi.string().required().min(2).max(50),
         email: joi.string().required().email(),
         password: joi.string().required().min(8).max(30),
         confirmPassword: joi
           .string()
           .required()
           .equal(joi.ref('password'))
           .messages({
             'any.only': 'Password does not match'
           })
       });
   
       const { error } = schema.validate(body);
   
       if (error) {
         console.log("Error create user controller ", error)
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       // Remove unnecessary password field
       delete body.confirmPassword;
   
       const { errorMsg, responseMsg } = await userService.createUser(req.body);
   
       if (errorMsg) {
         console.log("Error create user controller message: ", errorMsg)
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res.status(httpStatus.OK).json(responseHelper.SUCCESS(responseMsg));
     } catch (err) {
       console.log("Error create user controller catched: ", err)
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   const updateUser = async (req, res) => {
     try {
       const user = { ...req.body, ...req.params };
   
       const schema = joi.object({
         name: joi.string().min(2).max(50),
         email: joi.string().email()
       });
   
       const { error } = schema.validate(user);
   
       if (error && error.details) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const { id, ...rest } = req.body;
   
       const { errorMsg, responseMsg } = await userService.updateUser(
         req.user.id,
         rest
       );
   
       if (errorMsg) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res
         .status(httpStatus.OK)
         .json(responseHelper.SUCCESS(null, responseMsg));
     } catch (err) {
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   const changeUserPassword = async (req, res) => {
     try {
       const { body } = req;
   
       const schema = joi.object({
         oldPassword: joi.string().required().min(8).max(30),
         newPassword: joi
           .string()
           .required()
           .min(8)
           .max(30)
           .disallow(joi.ref('oldPassword'))
           .messages({
             'any.invalid': `New password shouldn't be the same as the old one`
           })
       });
   
       const { error } = schema.validate(body);
   
       if (error) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const { errorMsg, responseMsg } = await userService.changeUserPassword(
         req.user.id,
         body
       );
   
       if (errorMsg) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res.status(httpStatus.OK).json(responseHelper.SUCCESS(responseMsg));
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
     getAllUsers,
     createUser,
     updateUser,
     changeUserPassword
   };
   