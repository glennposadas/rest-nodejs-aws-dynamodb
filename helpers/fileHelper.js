/* ==========================================================================
   Dependencies
   ========================================================================== */

   const { uid } = require('rand-token');

   /* ==========================================================================
       Public Functions
       ========================================================================== */
   
   const mapItemFormat = (item) => {
     const {
       name,
       s3_name,
       key,
       type,
       organization_id,
       project_id,
       color,
       task_folder,
       task_id,
       comment_id,
       _id
     } = item;
   
     const parsedKey = key.replace(`${organization_id}/${project_id}/`, '');
     const path = parsedKey
       .split('/')
       .filter((x) => x !== s3_name && !!x)
       .join('/');
   
     return {
       id: _id,
       key,
       path,
       type,
       name,
       s3_name,
       color,
       task_folder,
       task_id,
       comment_id
     };
   };
   
   const formatUFilesStructure = (fileObjects) => fileObjects.map(mapItemFormat);
   
   const getRandomColor = () => {
     const min = Math.ceil(1);
     const max = Math.floor(5);
   
     return Math.floor(Math.random() * (max - min + 1)) + min;
   };
   
   const getRandomFolderName = () => uid(8);
   
   const getFileExtension = (name) => name.split('.').pop();
   
   const getRandomFileName = (name) => `${uid(8)}.${getFileExtension(name)}`;
   
   const checkObjectNotExist = (parentPath, files) => {
     const file = files
       .filter((object) => {
         const s3_name = object.s3_name + (object.type === 'folder' ? '/' : ''); // forward slash if folder
   
         // check if the existing file belongs to thesame parenthpath
         return object.key.replace(parentPath, '') === s3_name;
       })
       .pop();
   
     return !file;
   };
   
   /* ==========================================================================
       Exports
       ========================================================================== */
   
   module.exports = {
     formatUFilesStructure,
     mapItemFormat,
     checkObjectNotExist,
     getRandomFolderName,
     getRandomFileName,
     getRandomColor
   };
   