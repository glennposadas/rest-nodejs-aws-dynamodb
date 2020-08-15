/* ==========================================================================
   Dependencies
   ========================================================================== */

   const { v4: uuidv4 } = require('uuid');
   const dynamoService = require('./dynamoService');
   const constants = require('../constants');
   const passwordHelper = require('../helpers/passwordHelper');
   const authHelper = require('../helpers/authHelper');
   
   require('dotenv').config();
   
   /* ==========================================================================
      Private Functions
      ========================================================================== */
   
   const getUserByEmail = async (email) => {
     const userByEmail = await dynamoService.getItemByParams(
       process.env.AUTHORS_TABLE,
       'email-index',
       'email = :email',
       { ':email': email }
     );
   
     return userByEmail;
   };

   const aggregateUser = async (orgId, user) => {
    let team;
    let role;
    let avatar;
  
    if (user.teamId) {
      team = teamService.getTeamById(orgId, user.teamId);
    }
  
    if (user.roleId) {
      role = roleService.getRoleById(orgId, user.roleId);
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
         process.env.AUTHORS_TABLE,
         'email-index'
       );
   
       const promises = [];
   
       for (const user of userItems) {
         promises.push(aggregateUser(user));
       }
   
       userItems = await Promise.all(promises);
   
       return userItems;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getUserById = async (userId) => {
     try {
       let user = await dynamoService.getItemById(process.env.AUTHORS_TABLE, userId);
   
       user = await aggregateUser(user);
   
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
   
   const updateUser = async (id, userToUpdate) => {
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
   
       await dynamoService.updateTableItem(process.env.AUTHORS_TABLE, userId, {
         password: passwordUpdate
       });
   
       return {
         responseMsg: 'Password successfully updated!'
       };
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
     changeUserPassword
   };
   