/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const joi = require('joi');
   const userService = require('../services/userService');
   const authHelper = require('../helpers/authHelper');
   const roleService = require('../services/roleService');
   const sesService = require('../services/sesService');
   const { RESPONSE_MESSAGES } = require('../constants');
   const responseHelper = require('../helpers/responseHelper');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const getAllUsers = async (req, res) => {
     try {
       const users = await userService.getAllUsers();
   
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
           }),
         isInvite: joi.boolean(),
         code: joi.string().when('isInvite', {
           switch: [{ is: true, then: joi.required() }]
         })
       });
   
       const { error } = schema.validate(body);
   
       if (error) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       // Check if register came from invitation
       if (body.isInvite) {
         const { inviteErrorMsg } = await sesService.acceptInvitationEmail(
           body.code,
           body.email
         );
   
         if (inviteErrorMsg) {
           return res
             .status(httpStatus.BAD_REQUEST)
             .json(responseHelper.BAD_REQUEST(inviteErrorMsg));
         }
       }
   
       // Remove unnecessary password field
       delete body.isInvite;
       delete body.code;
       delete body.confirmPassword;
   
       // Add basic user role
       const userRole = await roleService.getRoleByName('User');
   
       req.body.roleId = userRole ? userRole._id : '';
   
       const { errorMsg, responseMsg } = await userService.createUser(req.body);
   
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
   
   const updateUser = async (req, res) => {
     try {
       const user = { ...req.body, ...req.params };
   
       const schema = joi.object({
         roleId: joi.string().length(20),
         name: joi.string().min(2).max(50),
         email: joi.string().email(),
         phoneNumber: joi.string().min(2).max(50),
         city: joi.string().min(2).max(50),
         state: joi.string().min(2).max(50),
         company: joi.string().min(2).max(50)
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
   
   const changeUserAvatar = async (req, res) => {
     try {
       const { body } = req;
   
       const schema = joi.object({
         name: joi.string().required(),
         type: joi.string().valid('image/png', 'image/jpeg').required(),
         size: joi
           .number()
           .max(1024 * 1024 * 5) // 5MB
           .required(),
         data: joi.string().base64().required()
       });
   
       const { error } = schema.validate(body);
   
       if (error) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const avatarSignedUrl = await userService.changeUserAvatar(
         req.user.id,
         body
       );
   
       return res
         .status(httpStatus.OK)
         .json(responseHelper.SUCCESS(null, avatarSignedUrl));
     } catch (err) {
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   const getUserAvatar = async (req, res) => {
     try {
       const user = await userService.getUserById(req.user.id);
   
       if (!user) {
         throw new Error('User not found');
       }
   
       const avatarSignedUrl = await authHelper.getUserAvatar(user.avatarKey);
   
       return res
         .status(httpStatus.OK)
         .json(responseHelper.SUCCESS(null, avatarSignedUrl));
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
     changeUserPassword,
     changeUserAvatar,
     getUserAvatar
   };
   