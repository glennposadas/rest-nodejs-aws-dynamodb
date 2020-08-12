/* ==========================================================================
   Dependencies
   ========================================================================== */

   const dynamoService = require('./dynamoService');
   const userService = require('./userService');
   const passwordHelper = require('../helpers/passwordHelper');
   const authHelper = require('../helpers/authHelper');
   
   require('dotenv').config();
   
   /* ==========================================================================
      Private Functions
      ========================================================================== */
   
   const getUserRefreshToken = async (tokenId, userId, token) => {
     const params = {
       TableName: process.env.REFRESH_TOKENS_TABLE,
       KeyConditionExpression: 'id = :tokenId AND userId = :userId',
       FilterExpression: 'refreshToken = :token',
       ExpressionAttributeValues: {
         ':userId': userId,
         ':tokenId': tokenId,
         ':token': token
       }
     };
   
     const res = await dynamoService.dynamo.query(params).promise();
   
     return res.Items[0] || null;
   };
   
   const deleteRefreshToken = async (tokenId, userId) => {
     const params = {
       TableName: process.env.REFRESH_TOKENS_TABLE,
       Key: {
         id: tokenId,
         userId
       }
     };
   
     await dynamoService.dynamo.delete(params).promise();
   };
   
   /* ==========================================================================
       Public Functions
       ========================================================================== */
   
   const login = async (email, password) => {
     try {
       const user = await userService.getUserByEmail(email);
   
       if (!user) {
         throw new Error('User not found');
       }
   
       const passwordHashChallenge = passwordHelper.createPasswordHash(
         user.id,
         password
       );
   
       if (passwordHashChallenge === user.password) {
         let avatarSignedUrl;
   
         if (user.avatarKey) {
           avatarSignedUrl = await authHelper.getUserAvatar(user.avatarKey);
         }

         user.avatar = avatarSignedUrl || null;
   
         delete user.password;
         delete user.avatarKey;
   
         const token = await authHelper.getTokens(user);
   
         return {
           token,
           user
         };
       }
   
       throw new Error('Incorrect password');
     } catch (err) {
       return null;
     }
   };
   
   const logout = async (refreshToken) => {
     try {
       const tokenObject = await authHelper.decodeToken(
         refreshToken,
         process.env.REFRESH_TOKEN_SECRET
       );
   
       if (!tokenObject) {
         throw new Error('Invalid token');
       }
   
       await deleteRefreshToken(tokenObject.tokenId, tokenObject.id);
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const refreshToken = async (refreshTokenVal) => {
     try {
       const tokenObject = await authHelper.decodeToken(
         refreshTokenVal,
         process.env.REFRESH_TOKEN_SECRET
       );
   
       if (!tokenObject) {
         throw new Error('Invalid token');
       }
   
       const [user, token] = await Promise.all([
         userService.getUserByEmail(tokenObject.email),
         getUserRefreshToken(tokenObject.tokenId, tokenObject.id, refreshTokenVal)
       ]);
   
       if (!user || !token) {
         throw new Error('Invalid token');
       }
   
       const organization = await organizationService.getOrganizationById(
         user.organizationId
       );
   
       if (!organization) {
         throw new Error('Organization not found');
       }
   
       user.organization = organization;
   
       delete user.organizationId;
   
       const newTokens = await authHelper.getTokens(user, tokenObject.tokenId);
   
       return newTokens;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = {
     login,
     logout,
     refreshToken
   };
   