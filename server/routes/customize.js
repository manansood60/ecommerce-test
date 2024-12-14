const express = require("express");
const router = express.Router();
const customizeController = require("../controller/customize");
const multer = require("multer");

// Configure Multer to store files temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // limit file size to 5MB
});

router.get("/get-slide-image", customizeController.getImages);
router.post("/delete-slide-image", customizeController.deleteSlideImage);
router.post(
  "/upload-slide-image",
  upload.single("image"),
  customizeController.uploadSlideImage
);
router.post("/dashboard-data", customizeController.getAllData);

module.exports = router;
