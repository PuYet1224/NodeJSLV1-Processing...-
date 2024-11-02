'use strict'

//!dmbg
const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

// Declare the Schema of the Mongo model
const shopSchema = new Schema({
    name:{
        type:String,
        trim : true,
        maxLength: 150
    },
    email:{
        type:String,
        unique: true,
        required: true
    },
    status:{ //trạng thái cho phép shop hoạt động hay không
        type:String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    password:{
        type:String,
        required:true,
    },
    verify: { //kiểm tra đăng ký thành công hay chưa
        type: Schema.Types.Boolean,
        default: false
    },
    roles: { //shop có quyền đăng bán sản phẩm, xóa sửa sản phẩm, truy cập vào 1 tài nguyên 
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);