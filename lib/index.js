'use strict';

/**
 * Module dependencies
 */

const admin = require("firebase-admin");
let bucket = undefined; 

module.exports = {
  provider: 'storage',
  name: 'Firestore',
  auth: {
    serviceAccount: {
      label: 'firebaseConfig JSON',
      type: 'textarea',
    },
    bucket: {
      label: 'Bucketname',
      type: 'text',
    }
  },
  init: (config) => {
    if(!bucket) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(config.serviceAccount)),
        storageBucket: config.bucket
      });
      bucket = admin.storage().bucket();
    }
  
    return {
      upload: async (file) => {
          const [ firestoreFile ] = await bucket.upload(file.tmpPath, {
            destination: `${file.hash}-${file.name}`,
            contentType: file.mime
          })

          file.url = firestoreFile.metadata.selfLink;
      },
      delete: async (file) => {
        const filename = `${file.hash}-${file.name}`;
        try {
          await bucket.file(filename).delete();
        } catch (error) {
          console.log(`Could not delete: ${error}`);
        }
      }
    };
  }
};