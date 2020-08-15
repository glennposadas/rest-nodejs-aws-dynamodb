/* ==========================================================================
   Dependencies
   ========================================================================== */

   const httpStatus = require('http-status-codes');
   const responseHelper = require('../../helpers/responseHelper');
   const roleService = require('../../services/roleService');
   const { RESPONSE_MESSAGES } = require('../../constants');
   
   /* ==========================================================================
      Public Functions
      ========================================================================== */
   
   const checkPermission = (permissions) => {
     return async (req, res, next) => {
       try {
         const { roleId } = req.user;
         const organizationId = req.user.organization.id;
   
         if (!organizationId || !roleId) {
           return res
             .status(httpStatus.UNAUTHORIZED)
             .json(
               responseHelper.UNAUTHORIZED(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST)
             );
         }
   
         // Check if Role exists
         const role = await roleService.getRoleById(organizationId, roleId);
   
         if (!role) {
           return res
             .status(httpStatus.BAD_REQUEST)
             .json(responseHelper.BAD_REQUEST());
         }
   
         // Check if User is permitted 
         if (
           role.permissions &&
           permissions.every(permission => {
             const p = permission.split('.');
             return role.permissions[p[0]][p[1]];
           })
         ) {
           next();
         } else {
           return res
             .status(httpStatus.UNAUTHORIZED)
             .json(
               responseHelper.UNAUTHORIZED(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST)
             );
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
   
   module.exports = checkPermission;
   