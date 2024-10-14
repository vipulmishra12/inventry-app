const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    getAllProduct,
    getSingleProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.get("/", protect, getAllProduct);
router.get("/:id", protect, getSingleProduct);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id", protect, updateProduct);

module.exports = router;