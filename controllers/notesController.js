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
     console.log("createNote controller...")
     try {
       const { body } = req;
   
       const schema = joi.object({
         title: joi.string().required().min(2).max(50),
         content: joi.string().required()
       });
   
       const { error } = schema.validate(body);
   
       if (error) {
         console.log("Error create notes controller ", error)
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const newNote = body;
       newNote.user_id = req.user.id;
       newNote.isActive = 1;
       
       const { errorMsg, responseMsg } = await notesService.createNote(body);
   
       if (errorMsg) {
         console.log("Error create notes controller message: ", errorMsg)
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res.status(httpStatus.OK).json(responseHelper.SUCCESS(responseMsg));
     } catch (err) {
       console.log("Error create notes controller catched: ", err)
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   const updateNote = async (req, res) => {
    console.log('notesController: updateNote');
     try {
       const note = { ...req.body, ...req.params };
   
       const schema = joi.object({
         id: joi.string().required(),
         title: joi.string().min(2).max(50),
         content: joi.string()
       });
   
       const { error } = schema.validate(note);
   
       if (error && error.details) {
        console.log('notesController: updateNote error1: ', error);
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const { id, ...rest } = req.body;

       console.log('notesController: updateNote req.body: ', JSON.stringify(rest));
   
       const { errorMsg, responseMsg } = await notesService.updateNote(
         note.id,
         rest
       );
   
       if (errorMsg) {
        console.log('notesController: updateNote errorMsg: ', errorMsg);
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res
         .status(httpStatus.OK)
         .json(responseHelper.SUCCESS(null, responseMsg));
     } catch (err) {
      console.log('notesController: updateNote error: ', err);
       return res
         .status(httpStatus.INTERNAL_SERVER_ERROR)
         .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
     }
   };
   
   // Deleting a note object will just set the `isActive` to 0.
   const deleteNote = async (req, res) => {
    console.log('notesController: updateNote');
     try {
       const note = { ...req.body, ...req.params };
   
       const schema = joi.object({
         id: joi.string().required(),
         title: joi.string().min(2).max(50),
         content: joi.string()
       });
   
       const { error } = schema.validate(note);
   
       if (error && error.details) {
        console.log('notesController: updateNote error1: ', error);
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(error.details[0].message));
       }
   
       const { id, ...rest } = req.body;

       // Set deleted.
       rest.isActive = 0;

       console.log('notesController: updateNote req.body: ', JSON.stringify(rest));
   
       const { errorMsg, responseMsg } = await notesService.updateNote(
         note.id,
         rest
       );
   
       if (errorMsg) {
        console.log('notesController: updateNote errorMsg: ', errorMsg);
         return res
           .status(httpStatus.BAD_REQUEST)
           .json(responseHelper.BAD_REQUEST(errorMsg));
       }
   
       return res
         .status(httpStatus.OK)
         .json(responseHelper.SUCCESS(null, 'Note ' + id + ' has been deleted!'));
     } catch (err) {
      console.log('notesController: updateNote error: ', err);
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
   