/* ==========================================================================
    Dependencies
    ========================================================================== */
    const S3 = require('aws-sdk/clients/s3');

    require('dotenv').config();
    
    const s3 = new S3({
      region: process.env.REGION,
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY
    });
    
    /* ==========================================================================
        Public Functions
        ========================================================================== */
    
    const listObjects = (params) => s3.listObjects(params).promise();
    
    const getObject = (params) => s3.getObject(params).promise();
    
    const putObject = (params) => s3.putObject(params).promise();
    
    const deleteObject = (params) => s3.deleteObject(params).promise();
    
    // Used for buffer body
    const upload = (params) => s3.upload(params).promise();
    
    const getPresignedUrl = (action, options) =>
      new Promise((resolve, reject) => {
        s3.getSignedUrl(action, options, (err, url) => {
          if (err) {
            return reject(err);
          }
    
          return resolve(url);
        });
      });
    
    // Make sure that '/' should be the last character of Key
    const createFolder = (Key) =>
      s3
        .putObject({
          Bucket: process.env.S3_FILE_STORAGE,
          Key
        })
        .promise();
    
    const emptyS3Directory = async (bucket, dir) => {
      try {
        const listParams = {
          Bucket: process.env.S3_FILE_STORAGE,
          Prefix: dir
        };
    
        const listedObjects = await s3.listObjectsV2(listParams).promise();
    
        if (listedObjects.Contents.length === 0) return;
    
        const deleteParams = {
          Bucket: process.env.S3_FILE_STORAGE,
          Delete: { Objects: [] }
        };
    
        listedObjects.Contents.forEach(({ Key }) => {
          deleteParams.Delete.Objects.push({ Key });
        });
    
        await s3.deleteObjects(deleteParams).promise();
    
        if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
      } catch (error) {
        // Log error somewhere but still respond success
        console.log(error.message);
      }
    };
    
    const deleteS3Object = async (key) => {
      try {
        // Delete file in s3
        const options = {
          Bucket: process.env.S3_FILE_STORAGE,
          Key: key
        };
    
        await s3.deleteObject(options).promise();
      } catch (error) {
        // Log error somewhere but still respond success
        console.log(error.message);
      }
    };
    
    const cutFolder = async (folderToMove, destinationFolder) => {
      const bucketName = process.env.S3_FILE_STORAGE;
    
      try {
        const listObjectsResponse = await s3
          .listObjects({
            Bucket: bucketName,
            Prefix: folderToMove,
            Delimiter: '/'
          })
          .promise();
    
        const folderContentInfo = listObjectsResponse.Contents;
        const folderPrefix = listObjectsResponse.Prefix;
    
        await Promise.all(
          folderContentInfo.map(async (fileInfo) => {
    
            await s3
              .copyObject({
                Bucket: bucketName,
                CopySource: `${bucketName}/${fileInfo.Key}`, // old file Key
                Key: `${destinationFolder}${fileInfo.Key.replace(folderPrefix, '')}` // new file Key
              })
              .promise();
          })
        );
    
        await emptyS3Directory(bucketName, folderToMove);
      } catch (err) {
        console.error(err); // error handling
      }
    };
    
    /* ==========================================================================
        Exports
        ========================================================================== */
    
    module.exports = {
      listObjects,
      getObject,
      putObject,
      deleteObject,
      createFolder,
      getPresignedUrl,
      upload,
      emptyS3Directory,
      deleteS3Object,
      cutFolder
    };
    