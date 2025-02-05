'use strict'

const express = require('express');
const router = express.Router()
const { asyncHandler } = require('../../auth/checkAuth');
const productController = require('../../controllers/product.controller.js');
const { authenticationV2 } = require('../../auth/authUtils')

// authentication //
router.use(authenticationV2)
/////////////////////////////

router.post('', asyncHandler(productController.createProduct))
router.post('/publish/:id', asyncHandler(productController.publishProductByShop))

// QUERY //
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishForShop))

module.exports = router;