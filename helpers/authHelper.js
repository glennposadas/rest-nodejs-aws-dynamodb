/* ==========================================================================
   Dependencies
   ========================================================================== */

   const moment = require('moment');
   const jwt = require('jsonwebtoken');
   const { uuid } = require('uuidv4');
   const uploadService = require('../services/uploadService');
   const dynamoService = require('../services/dynamoService');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const decodeToken = (token, secret) =>
     new Promise((resolve) => {
       jwt.verify(token, secret, (err, decoded) => {
         if (err) {
           return resolve(null);
         }
   
         resolve(decoded);
       });
     });
   
   const getAccessToken = (payload) => {
     try {
       // Delete organization config
       if (payload.organization) {
         delete payload.organization.config;
       }
   
       const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
         expiresIn: process.env.ACCESS_TOKEN_TTL
       });
   
       return token;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getRefreshToken = async (payload, tokenId = null) => {
     try {
       const id = tokenId || uuid();
       const token = jwt.sign(
         {
           ...payload,
           tokenId: id
         },
         process.env.REFRESH_TOKEN_SECRET,
         {
           expiresIn: process.env.REFRESH_TOKEN_TTL
         }
       );
   
       await dynamoService.addTableItem(process.env.REFRESH_TOKENS_TABLE, {
         id,
         userId: payload.id,
         refreshToken: token,
         ttl: moment().add(30, 'days').unix()
       });
   
       return token;
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getTokens = async (payload, refreshTokenId = null) => {
     try {
       const accessToken = getAccessToken(payload);
       const refreshToken = await getRefreshToken(payload, refreshTokenId);
   
       return {
         accessToken,
         refreshToken
       };
     } catch (err) {
       throw new Error(err.message);
     }
   };
   
   const getUserAvatar = async (key) => {
     try {
       const url = await uploadService.generatePresignedUrl(key);
   
       return url;
     } catch (error) {
       return null;
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = {
     decodeToken,
     getTokens,
     getAccessToken,
     getRefreshToken,
     getUserAvatar
   };
   