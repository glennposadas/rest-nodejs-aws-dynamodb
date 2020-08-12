/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const moment = require('moment');
   const responseHelper = require('../../helpers/responseHelper');
   const authHelper = require('../../helpers/authHelper');
   const { RESPONSE_MESSAGES } = require('../../constants');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const authMiddleware = async (req, res, next) => {
     try {
       const token = req.headers['access-token'] || req.query.accessToken;
   
       const decoded = await authHelper.decodeToken(
         token,
         process.env.ACCESS_TOKEN_SECRET
       );
   
       if (decoded) {
         if (moment().isBefore(moment.unix(decoded.exp))) {
           req.user = decoded;
           next();
         } else {
           throw new Error('Invalid token');
         }
       } else {
         throw new Error('Access token not found');
       }
     } catch (error) {
       return res
         .status(httpStatus.UNAUTHORIZED)
         .json(responseHelper.BAD_REQUEST(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST));
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = authMiddleware;
   