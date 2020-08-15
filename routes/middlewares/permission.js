/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const responseHelper = require('../../helpers/responseHelper');
   const { RESPONSE_MESSAGES } = require('../../constants');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const requireMinAccessLevel = (accessLevel) => {
     return async (req, res, next) => {
       console.log('require min access level...');
       try {
         const { role } = req.user;
   
         if (!role) {
           return res
             .status(httpStatus.UNAUTHORIZED)
             .json(
               responseHelper.UNAUTHORIZED(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST)
             );
         }
      
         if (accessLevel == ACCESS_LEVELS.admin) {
          if (role == accessLevel) {
            console.log("Hey admin! ✅")
            next();
          } else {
            console.log("This route is only for admins! 😩")
            return res
            .status(httpStatus.UNAUTHORIZED)
            .json(
              responseHelper.UNAUTHORIZED(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST)
            );
          }
        } else {
          console.log("Hello authenticated user! ✅")
          next();
        }
          
       } catch (error) {
         return res
           .status(httpStatus.INTERNAL_SERVER_ERROR)
           .json(responseHelper.SERVER_ERROR(RESPONSE_MESSAGES.SERVER_ERROR));
       }
     }
   };
   
   /* ==========================================================================
      Exports
      ========================================================================== */
   
   module.exports = requireMinAccessLevel;
   