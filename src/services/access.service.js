'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt') 
const crypto = require('node:crypto') 
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ForbiddenError, AuthFailureError } = require("../core/error.response")

//service////
const { findByEmail } = require("./shop.service")
const { verify } = require('node:crypto') 
const RoleShop = {
    //nên đặt tên bằng ký tự
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    
    /*
        check this token used?
    */
    static handleRefreshToken = async ( refreshToken ) =>{

        //check xem token nay da duoc su dung chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken )
        // neu co
        if(foundToken){
            // decode xem ng truy cap vao token la ai 
            const { userId, email } = await verifyJWT( refreshToken, foundToken.privateKey)
            console.log({userId, email})
            //xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something Wrong Happening Here!! Please login again!')
        }

        // neu chua
        const holderToken = await KeyTokenService.findByRefreshToken( refreshToken )
        // neu tim khong duoc
        if(!holderToken) throw new AuthFailureError('Shop Not Registered 1!')
        // neu tim duoc (verify token)
        const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey)
        console.log('[2]--', {userId, email})

        // check userId
        const foundShop = await findByEmail( {email} )

        // neu tim khong duoc
        if(!foundShop) throw new AuthFailureError('Shop Not Registered 2!')
            
        // neu tim duoc (create 1 cap token moi)
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey , holderToken.privateKey)

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken // da duoc su dung de lay token moi 
            }
        })
        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async ( keyStore ) =>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }

    /*
        1 - check email in dbs
        2 - match password user and password in out dbs
        3 - create AT vs RT and save
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {

        // Step 1
        const foundShop = await findByEmail({email})
            if(!foundShop) throw new BadRequestError('Shop not registered!')
        // Step 2
            const match = bcrypt.compare(password, foundShop.password)
            if(!match) throw new AuthFailureError('Authentication error!')
        // Step 3   
            // created privateKey, publicKey
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')
        // Step 4         
            const { _id: userId } = foundShop
            const tokens = await createTokenPair({userId, email}, publicKey , privateKey)

            await KeyTokenService.createKeyToken({
                refreshToken: tokens.refreshToken,  
                privateKey, publicKey, userId

            })
            return {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop}),
                tokens
                }
             }

    static signUp = async ({name, email, password }) => {
        // try {
            // Step 1: Check if email exists
            const holderShop = await shopModel.findOne({ email }).lean()
            if(holderShop){
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10)

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })
            
            if(newShop){
            // created privateKey, publicKey
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({ privateKey, publicKey }) //save collection KeyStore

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                });
                
                if (!keyStore) {
                    //throw new BadRequestError('Error: Shop already registered!') thay the return ben duoi duoc

                    return {
                        code: 'xxxx',
                        message: 'KeyStore error!'
                    };
                }
                console.log('Stored keys in MongoDB successfully');
                
                // Create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey , privateKey)
                console.log(`Created Tokens Success::`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }

//         } catch (error) {
//             console.error(error)
//             return {
//                 code: 'xxx',
//                 message: error.message,
//                 status: 'error'
//             }
//         }
    }
}

module.exports = AccessService
