'use strict'

const express = require('express');
const router = express.Router()
const { asyncHandler } = require('../../auth/checkAuth');
const productController = require('../../controllers/product.controller.js');

router.post('', asyncHandler(productController.createProduct))
module.exports = router;