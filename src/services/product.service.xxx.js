'use strict'

const { BadRequestError } = require('../core/error.response')
const { product, clothing, electronic, furniture} = require('../models/product.model')
const {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop
} = require('../models/repo/product.repo')

// define factory class to create product
class ProductFactory {

    static productRegistry = {} //key-class

    static registerProductType( type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

        return new productClass( payload ).createProduct()
    }

    // PUT //
    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop({product_shop, product_id})
    }   
    // END PUT //
    
    //query
    static async findAllDraftForShop({product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isDraft: true }
        return await findAllDraftForShop({query, limit, skip})
    }

    static async findAllPublishForShop({product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isPublished: true }
        return await  ({query, limit, skip})
    }
}

// define base product class
class Product {

    constructor({
        product_name, product_thumb, product_description, product_price,
        product_type, product_shop, product_attributes, product_quantity
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_quantity = product_quantity
    }

    // create new product
    async createProduct( product_id ){
        return await product.create({...this, _id: product_id})
    }  
}

//Define sub-class for different product types Clothing
class Clothing extends Product{

    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw new BadRequestError(' create new Clothing error')

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError(' create new Clothing error')

        return newProduct;
    }
}

//Define sub-class for different product types Electronics
class Electronics extends Product{

    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError(' create new Electronics error')

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError(' create new Product error')

        return newProduct;
    }
}

//Define sub-class for different product types Furniture
class Furniture extends Product{

    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError(' create new Furnitures error')

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError(' create new Product error')

        return newProduct;
    }
}

// register product types
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory