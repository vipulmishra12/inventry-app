const asyncHandler = require('express-async-handler')
const Product = require("../models/productModel")
const { fileSizeFormatter } = require("../utils/fileUpload")
// const multer = require('multer');
const cloudinary = require("cloudinary").v2

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body

    //validation

    if (!name || !category || !quantity || !price || !description) {
        res.status(400)
        throw new Error("Please fill all details")
    }

    //handle image upload

    let fileData = {};
    if (req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Pinvent App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
    }

    //create product

    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    })

    res.status(201).json(product)
})


//get all product 

const getAllProduct = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id }).sort("-createdAt")
    res.status(200)
    res.json(products)
})

//get single Product

const getSingleProduct = asyncHandler(async (req, res) => {


    const product = await Product.findById(req.params.id);
    // if product doesnt exist
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }
    // Match product to its user
    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    res.status(200).json(product);
});


//delete product 

const deleteProduct = asyncHandler(async (req, res) => {
    // Find the product by ID
    const product = await Product.findById(req.params.id);

    // Check if product exists
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if the user is authorized to delete the product
    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    // Delete the product
    await product.deleteOne();

    // Respond with a success message
    res.status(200).json({ message: "Product deleted successfully" });
});

//update product

const updateProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body



    const product = await Product.findById(req.params.id)

    // Check if product exists

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Match product to its user

    if (product.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }


    //handle file upload

    let fileData = {};
    if (req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Pinvent App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
    }

    //create product

    const updatedProduct = await Product.findByIdAndUpdate(
        { _id: req.params.id },
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,
        },
        {
            new: true,
            runValidators: true
        }
    )


    res.status(200).json(updatedProduct)
})


module.exports = {
    createProduct,
    getAllProduct,
    getSingleProduct,
    deleteProduct,
    updateProduct,
}