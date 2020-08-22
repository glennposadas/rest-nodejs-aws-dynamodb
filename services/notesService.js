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
       // This service function is only for admins.
       if (currentUser.role_type == 'author') {
         throw new Error('This endpoint is for admin only!')
         return;
       }

       const authors = await dynamoService.queryWithIndex(
         process.env.AUTHORS_TABLE,
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
   
   const getNoteById = async (userId) => {
     try {
       let user = await dynamoService.getItemById(process.env.AUTHORS_TABLE, userId);
   
       user = await aggregateUser(user);
   
       return user;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const createNote = async (note) => {
     try {
       const email = user.email;
   
       const [existingUser] = await Promise.all([
         getUserByEmail(email)
       ]);
   
       if (existingUser) {
         return {
           errorMsg: constants.RESPONSE_MESSAGES.EXISTING_PARAMETER(email)
         };
       }
   
       const id = uuidv4();
   
       user.id = id;
   
       // Hash password
       user.password = passwordHelper.createPasswordHash(id, user.password);
   
       console.log('UserService: createUser to table ' + process.env.AUTHORS_TABLE + ' with user object: ' + JSON.stringify)

       const responseMsg = await dynamoService.addTableItem(
         process.env.AUTHORS_TABLE,
         user
       );
   
       return {
         responseMsg
       };
     } catch (err) {
       console.log('User service createUser error: ', err)
       throw new Error(err.message);
     }
   };
   
   const updateNote = async (id, userToUpdate) => {
     try {
       const responseMsg = await dynamoService.updateTableItem(
         process.env.AUTHORS_TABLE,
         id,
         userToUpdate
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
     getNoteById,
     createNote,
     updateNote
   };
   