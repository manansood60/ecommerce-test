const path = require("path");
const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const bucket = require('../config/firebase'); // Firebase storage bucket instance
const fs = require("fs");
const { format } = require("util");

class Category {
  getAllCategory = async (req, res) => {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  postAddCategory = async (req, res) => {
    try {
 
      let { cName, cDescription, cStatus } = req.body;
      if (!req.file || !cName || !cDescription || !cStatus) {
        return res.status(400).json({ error: "All fields must be required" });
      }
  
      // Process the image upload to Firebase Storage using a promise
      const cImage = await this.uploadImageToFirebase(req.file);
  
      cName = toTitleCase(cName);
  
      // Check if category already exists
      const checkCategoryExists = await categoryModel.findOne({ cName });
      if (checkCategoryExists) {
        return res.status(400).json({ error: "Category already exists" });
      }
  
      // Create new category
      const newCategory = new categoryModel({
        cName,
        cDescription,
        cStatus,
        cImage,
      });
  
      await newCategory.save();
      console.log("Category Created");
      return res.status(201).json({ success: "Category created successfully" });
  
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "An error occurred while creating the category" });
    }
  }


  postEditCategory = async (req, res) => {
    let { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.json({ error: "Category ID must be provided" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  getDeleteCategory = async (req, res) => {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "Category ID must be provided" });
    } else {
      try {
         // Find the category and get the image path
        const categoryToDelete = await categoryModel.findById(cId);
        if (!categoryToDelete) {
          return res.status(404).json({ error: "Category not found" });
        }
        // Extract the image URL from the category (this assumes cImage is the URL)
        const imageUrl = categoryToDelete.cImage;
        // Extract the file name from the image URL (e.g., "1725988306505.jpeg")
        const fileName = path.basename(new URL(imageUrl).pathname);
        // Delete the image from Firebase Storage
        await this.deleteImageFromFirebase(fileName);
        // Now delete the category from the database

        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          // Delete Image from uploads -> categories folder 
          return res.json({ success: "Category deleted successfully" });
        }
      } catch (err) {
        console.error("Error deleting category or image:", err);
        return res.status(500).json({ error: "An error occurred while deleting the category" });
      }
    }
  }
  // Helper function to upload image to Firebase Storage
  uploadImageToFirebase = async (file) => {    
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
  deleteImageFromFirebase = async (fileName) => {
    try {
      const file = bucket.file(fileName); // Get a reference to the file in Firebase Storage
      await file.delete(); // Delete the file
      console.log(`Image ${fileName} deleted successfully from Firebase Storage`);
    } catch (error) {
      console.error("Error deleting image from Firebase Storage:", error);
      throw new Error('Error deleting the image from Firebase Storage');
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
