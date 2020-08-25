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
      '/notes/mine',
      permission('author'),
      notesController.getMyNotes
    );
     router.get(
      '/notes/:noteId',
      permission('author'),
      notesController.getSpecificNote
    );
     router.post(
       '/notes/new',
       permission('author'),
       notesController.createNote
     );
     router.put(
      '/notes/update',
      permission('author'),
      notesController.updateNote
    );
    router.delete(
      '/notes/delete',
      permission('author'),
      notesController.deleteNote
    );
   };
   