/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const responseHelper = require('../../helpers/responseHelper');
   const { ACCESS_LEVELS } = require('../../constants');
   const { RESPONSE_MESSAGES } = require('../../constants');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const requireMinAccessLevel = (accessLevel) => {
     return async (req, res, next) => {
       console.log('require min access level...');
       try {
         const roleType = req.user.role_type;
   
         console.log('permission: roletype: ', roleType);
         console.log('permission: accessLevel: ', accessLevel);
         console.log('accessLevel: ', ACCESS_LEVELS.admin);

         if (!roleType) {
           return res
             .status(httpStatus.UNAUTHORIZED)
             .json(
               responseHelper.UNAUTHORIZED(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST)
             );
         }
    
         if (accessLevel == ACCESS_LEVELS.admin) {
          if (roleType == accessLevel) {
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
         console.log('permission: error: ', error);
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
   