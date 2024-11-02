'use strict';

const mongoose = require('mongoose');
const { db: { host, name, port } } = require('../configs/congif.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`

const { countConnect } = require('../helpers/check.connect')

console.log(`Full connection string:`, connectString);

class Database {

    constructor(){
        this.connect();
    }
    // Connect
    connect(type = 'mongodb'){
        mongoose.set('debug', true);
        mongoose.set('debug', { color: true });

        mongoose.connect(connectString, {
            maxPoolSize: 50
         }).then(async () => {
            console.log(`Connected to MongoDB successfully`, countConnect());

            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Current Collections:', collections.map(c => c.name));
        }).catch(err => {
            console.log(`Error Connect!`, err);
        });
    }
    
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
