'use strict'

const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.xxx")
const {SuccessResponse} = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) =>{
    //     new SuccessResponse({
    //         message: 'Create New Product Success!',
    //         metadata: await ProductService.createProduct( req.body.product_type,{
    //             ... req.body,
    //             product_shop: req.user.userId
    //         })
    //     }).send(res)
    // }

    new SuccessResponse({
        message: 'Create New Product Success!',
        metadata: await ProductServiceV2.createProduct( req.body.product_type,{
            ... req.body,
            product_shop: req.user.userId
        })
    }).send(res)
    }

    publishProductByShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Create New Product Success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

     // QUERY //
     /**
      * @desc Get all Drafts for shop
      * @param {Number} limit 
      * @param {Number}  skip
      * @return {JSON}  
      */
     getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list success!',
            metadata: await ProductServiceV2.findAllDraftForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }



    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    // END QUERY //
}

module.exports = new ProductController()