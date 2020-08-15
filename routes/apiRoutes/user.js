/* ==========================================================================
   Dependencies
   ========================================================================== */

   const userController = require('../../controllers/userController');
   const checkPermission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = (router) => {
     router.get(
       '/:orgId/user/all',
       checkPermission(['settings.read']),
       userController.getAllUsers
     );
     router.put(
       '/:orgId/user/update',
       checkPermission(['settings.write']),
       userController.updateUser
     );
     router.put(
       '/:orgId/user/password/change',
       checkPermission(['settings.write']),
       userController.changeUserPassword
     );
     router.post(
       '/:orgId/user/avatar',
       checkPermission(['settings.write']),
       userController.changeUserAvatar
     );
     router.get(
       '/:orgId/user/avatar',
       checkPermission(['settings.read']),
       userController.getUserAvatar
     );
   };
   