const path = require("path");
const bucket = require('./../config/firebase.js'); // Firebase storage bucket instance

// Helper function to upload image to Firebase Storage
const uploadImageToFirebase = async (file) => {    
    return new Promise((resolve, reject) => {
        const blob = bucket.file(Date.now() + path.extname(file.originalname)); // Generate unique filename
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error("Error uploading image:", err);
            reject('Error uploading the Image file.');
        });

        blobStream.on('finish', async () => {
            try {
                // Make the file public
                await blob.makePublic();
                // Get the public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl); // Resolve with the public URL
            } catch (error) {
                reject('Error making the image public.');
            }
        });
        blobStream.end(file.buffer);
    });
}
// Helper function to delete an image from Firebase Storage
const deleteImageFromFirebase = async (fileName) => {
    try {
        const file = bucket.file(fileName); // Get a reference to the file in Firebase Storage
        await file.delete(); // Delete the file
        console.log(`Image ${fileName} deleted successfully from Firebase Storage`);
    } catch (error) {
        console.error("Error deleting image from Firebase Storage:", error);
        throw new Error('Error deleting the image from Firebase Storage');
    }
}

module.exports = {uploadImageToFirebase, deleteImageFromFirebase};