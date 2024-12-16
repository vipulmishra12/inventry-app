const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProduct,
    getSingleProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/", protect, getAllProduct);
router.get("/:id", protect, getSingleProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;