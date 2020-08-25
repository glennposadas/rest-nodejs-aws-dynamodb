/* ==========================================================================
   Dependencies
   ========================================================================== */

   const { v4: uuidv4 } = require('uuid');
   const dynamoService = require('./dynamoService');
   const constants = require('../constants');
   
   require('dotenv').config();
   
   /* ==========================================================================
      Private Functions
      ========================================================================== */
   

   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const getAllNotes = async () => {
     try {
       const authors = await dynamoService.queryWithIndex(
         process.env.NOTES_TABLE,
         'active-index',
         'isActive = :isActive',
         { ':isActive': 1 }
       );

       return authors;
     } catch (err) {
       console.log('Note service get all notes error: ' + err);
       throw new Error(err.message);
     }
   };

  const getMyNotes = async (currentUserId) => {
    try {
      const notes = await dynamoService.queryWithIndex(
        process.env.NOTES_TABLE,
        'user_id-index',
        'user_id = :b and isActive = :a',
        {
          ':a': 1,
          ':b': currentUserId
        }
      );

      return notes;
    } catch (err) {
      console.log('Note service get all notes error: ' + err);
      throw new Error(err.message);
    }
  };

   const getSpecificNote = async (currentUserId, noteId) => {
     try {
       console.log('get specific note: ', noteId);
       const notes = await dynamoService.getItemByParams(
         process.env.NOTES_TABLE,
         'noteuser_id-index',
         'user_id = :b and id = :c',
         {
           ':c': noteId,
           ':b': currentUserId
         }
       );

       return notes;
     } catch (err) {
       console.log('Note service get all notes error: ' + err);
       throw new Error(err.message);
     }
   }
   
   const createNote = async (note) => {
     try {
       const id = uuidv4();
   
       note.id = id;

       const responseMsg = await dynamoService.addTableItem(
         process.env.NOTES_TABLE,
         note
       );
   
       return {
         responseMsg
       };
     } catch (err) {
       console.log('notesSfervice createNote error: ', err)
       throw new Error(err.message);
     }
   };
   
   const updateNote = async (id, noteToBeUpdated) => {
     try {
       const responseMsg = await dynamoService.updateTableItem(
         process.env.NOTES_TABLE,
         id,
         noteToBeUpdated
       );
   
       return {
         responseMsg
       };
     } catch (err) {
       console.error(err);
       throw new Error(err.message);
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
     updateNote
   };