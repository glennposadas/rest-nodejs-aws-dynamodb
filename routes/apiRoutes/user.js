/* ==========================================================================
   Dependencies
   ========================================================================== */

   const userController = require('../../controllers/userController');
   const permission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = router => {
     router.get(
       '/user/all',
       permission('admin'),
       userController.getAllUsers
     );
     router.put(
       '/user/update',
       permission('author'),
       userController.updateUser
     );
     router.put(
       '/user/password/change',
       permission('author'),
       userController.changeUserPassword
     );
   };
   