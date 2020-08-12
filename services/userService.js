/* ==========================================================================
   Dependencies
   ========================================================================== */

   const { uuid } = require('uuidv4');
   const moment = require('moment');
   const dynamoService = require('./dynamoService');
   const roleService = require('./roleService');
   const teamService = require('./teamService');
   const s3Service = require('./s3Service');
   const uploadService = require('./uploadService');
   const constants = require('../constants');
   const passwordHelper = require('../helpers/passwordHelper');
   const imageHelper = require('../helpers/imageHelper');
   const authHelper = require('../helpers/authHelper');
   
   require('dotenv').config();
   
   /* ==========================================================================
      Private Functions
      ========================================================================== */
   
   const getUserByEmail = async (email) => {
     const userByEmail = await dynamoService.getItemByParams(
       process.env.USERS_TABLE,
       'email-index',
       'email = :email',
       { ':email': email }
     );
   
     return userByEmail;
   };
   
   const aggregateUser = async (user) => {
     let team;
     let role;
     let avatar;
   
     if (user.teamId) {
       team = teamService.getTeamById(user.teamId);
     }
   
     if (user.roleId) {
       role = roleService.getRoleById(user.roleId);
     }
   
     if (user.avatarKey) {
       avatar = authHelper.getUserAvatar(user.avatarKey);
     }
   
     // Other way to do asynchronous requests
     team = await team;
     role = await role;
     avatar = await avatar;
   
     if (team) {
       user.team = {
         name: team.name
       };
     }
   
     if (role) {
       user.role = {
         name: role.name
       };
     }
   
     if (avatar) {
       user.avatar = avatar;
     }
   
     return user;
   };
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const getAllUsers = async () => {
     try {
       let userItems = await dynamoService.queryWithIndex(
         process.env.USERS_TABLE,
         'email-index'
       );
   
       const promises = [];
   
       for (const user of userItems) {
         promises.push(aggregateUser(orgId, user));
       }
   
       userItems = await Promise.all(promises);
   
       return userItems;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getUserById = async (userId) => {
     try {
       let user = await dynamoService.getItemById(process.env.USERS_TABLE, userId);
   
       user = await aggregateUser(user.organizationId, user);
   
       return user;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const createUser = async (user) => {
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
   
       const id = uuid();
   
       user.id = id;
   
       // Hash password
       user.password = passwordHelper.createPasswordHash(id, user.password);
   
       const responseMsg = await dynamoService.addTableItem(
         process.env.USERS_TABLE,
         user
       );
   
       return {
         responseMsg
       };
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const updateUser = async (orgId, id, userToUpdate) => {
     try {
       if (userToUpdate.roleId) {
         const role = await roleService.getRoleById(orgId, userToUpdate.roleId);
   
         if (!role) {
           return {
             errorMsg: constants.RESPONSE_MESSAGES.DOES_NOT_EXIST_PARAMETER(
               constants.ELASTICSEARCH_INDICES.ROLE
             )
           };
         }
       }
   
       if (userToUpdate.teamId) {
         const team = await teamService.getTeamById(orgId, userToUpdate.teamId);
   
         if (!team) {
           return {
             errorMsg: constants.RESPONSE_MESSAGES.DOES_NOT_EXIST_PARAMETER(
               constants.ELASTICSEARCH_INDICES.TEAM
             )
           };
         }
       }
   
       const responseMsg = await dynamoService.updateTableItem(
         process.env.USERS_TABLE,
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
   
   const changeUserPassword = async (userId, passwordValues) => {
     try {
       const { oldPassword, newPassword } = passwordValues;
   
       const user = await getUserById(userId);
   
       if (!user) {
         return {
           errorMsg: 'User does not exist'
         };
       }
   
       const passwordChallenge = passwordHelper.createPasswordHash(
         userId,
         oldPassword
       );
   
       if (passwordChallenge !== user.password) {
         return {
           errorMsg: 'Incorrect old password'
         };
       }
   
       const passwordUpdate = passwordHelper.createPasswordHash(
         userId,
         newPassword
       );
   
       await dynamoService.updateTableItem(process.env.USERS_TABLE, userId, {
         password: passwordUpdate
       });
   
       return {
         responseMsg: 'Password successfully updated!'
       };
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const changeUserAvatar = async (userId, { data }) => {
     try {
       const user = await getUserById(userId);
   
       if (!user) {
         return {
           errorMsg: 'User does not exist'
         };
       }
   
       const key = `avatar/${userId}-${moment().valueOf()}.png`;
   
       if (user.avatarKey) {
         await s3Service.deleteObject({
           Bucket: process.env.S3_FILE_STORAGE,
           Key: user.avatarKey
         });
       }
   
       const { buffer: avatarBuffer, mime } = await imageHelper.formatAvatar(
         Buffer.from(data, 'base64')
       );
   
       await Promise.all([
         s3Service.putObject({
           Bucket: process.env.S3_FILE_STORAGE,
           Key: key,
           Body: avatarBuffer,
           ContentType: mime,
           ContentEncoding: 'base64'
         }),
         dynamoService.updateTableItem(process.env.USERS_TABLE, userId, {
           avatarKey: key
         })
       ]);
   
       // Get new avatar presigned Url
       const signedUrl = await uploadService.generatePresignedUrl(key);
   
       return signedUrl;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = {
     getUserByEmail,
     getAllUsers,
     getUserById,
     createUser,
     updateUser,
     changeUserPassword,
     changeUserAvatar
   };
   