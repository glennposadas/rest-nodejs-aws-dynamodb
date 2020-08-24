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
       const notes = await notesService.getAllNotes();
   
       return res.status(httpStatus.OK).json(responseHelper.SUCCESS(null, notes));
     } catch (err) {
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };

   const getMyNotes = async (req, res) => {
    try {
      const userId = req.user.id;
      const notes = await notesService.getMyNotes(userId);
  
      return res.status(httpStatus.OK).json(responseHelper.SUCCESS(null, notes));
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };

  const getSpecificNote = async (req, res) => {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;
      const note = await notesService.getSpecificNote(userId, noteId);
  
      return res.status(httpStatus.OK).json(responseHelper.SUCCESS(null, note));
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
    }
  };
   
   const createNote = async (req, res) => {
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
   
   const updateNote = async (req, res) => {
     try {
       const note = { ...req.body, ...req.params };
   
       const schema = joi.object({
         title: joi.string().min(2).max(50),
         content: joi.string()
       });
   
       const { error } = schema.validate(note);
   
       if (error && error.details) {
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const { id, ...rest } = req.body;

       console.log('notesController: updateNote req.body: ', JSON.stringify(req.body));
   
       const { errorMsg, responseMsg } = await notesService.updateNote(
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
   
   const deleteNote = async (req, res) => {
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
     getAllNotes,
     getMyNotes,
     getSpecificNote,
     createNote,
     updateNote,
     deleteNote
   };
   