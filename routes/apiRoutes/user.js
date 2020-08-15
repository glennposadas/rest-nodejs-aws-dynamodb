/* ==========================================================================
   Dependencies
   ========================================================================== */

   const userController = require('../../controllers/userController');
   const permission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = (router) => {
     router.get(
       '/:orgId/user/all',
       permission('admin'),
       userController.getAllUsers
     );
     router.put(
       '/:orgId/user/update',
       permission('user'),
       userController.updateUser
     );
     router.put(
       '/:orgId/user/password/change',
       permission('user'),
       userController.changeUserPassword
     );
   };
   