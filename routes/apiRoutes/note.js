/* ==========================================================================
   Dependencies
   ========================================================================== */

   const notesController = require('../../controllers/notesController');
   const permission = require('../middlewares/permission');
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = router => {
     router.get(
       '/notes/all',
       permission('admin'),
       notesController.getAllNotes
     );
     router.get(
      '/notes',
      permission('author'),
      notesController.getNoteById
    );
     router.put(
       '/user/update',
       permission('author'),
       notesController.updateNotes
     );
     router.put(
       '/user/password/change',
       permission('author'),
       notesController.changeUserPassword
     );
   };
   