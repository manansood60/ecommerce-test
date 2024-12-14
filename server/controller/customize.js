const fs = require("fs");
const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const customizeModel = require("../models/customize");
const { uploadImageToFirebase, deleteImageFromFirebase } = require("./utility");
const path = require("path");

class Customize {
  async getImages(req, res) {
    try {
      let Images = await customizeModel.find({});
      if (Images) {
        return res.json({ Images });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async uploadSlideImage(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: "No Image Found" });
    }
    // Process the image upload to Firebase Storage using a promise
    const image = await uploadImageToFirebase(req.file);
    try {
      let newCustomzie = new customizeModel({
        slideImage: image,
      });
      let save = await newCustomzie.save();
      if (save) {
        return res.json({ success: "Image upload successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async deleteSlideImage(req, res) {
    let { id } = req.body;
    if (!id) {
      return res.json({ error: "Image id must be provided" });
    } else {
      try {
        let deletedSlideImage = await customizeModel.findById(id);
        if (!deletedSlideImage) {
          return res.status(404).json({ error: "Slide Image not found" });
        }
         // Extract the image URL from the category (this assumes cImage is the URL)
         const imageUrl = deletedSlideImage.slideImage;
         // Extract the file name from the image URL (e.g., "1725988306505.jpeg")
         const fileName = path.basename(new URL(imageUrl).pathname);
         // Delete the image from Firebase Storage
         await deleteImageFromFirebase(fileName);
         // Now delete the category from the database
 
        let deleteImage = await customizeModel.findByIdAndDelete(id);
        if (deleteImage) {
          return res.json({ success: "Image deleted successfully" });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred while deleting the Image" });
      }
    }
  }

  async getAllData(req, res) {
    try {
      let Categories = await categoryModel.find({}).count();
      let Products = await productModel.find({}).count();
      let Orders = await orderModel.find({}).count();
      let Users = await userModel.find({}).count();
      if (Categories && Products && Orders) {
        return res.json({ Categories, Products, Orders, Users });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;
