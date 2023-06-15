const { ObjectId } = require('mongodb');


const jsonwebtoken = require('jsonwebtoken');

var config = require("../../config/setting.json");
class CTGioHangService{
    databaseConnection = require('../database/database');
    product = require('../models/CTGioHang');
    productType = require('../models/product');
    client;
    ProductDatabase;
    ProductCollection;
    constructor(){
        this.client = this.databaseConnection.getMongoClient();
        this.ProductDatabase =  this.client.db(config.mongodb.database);
        this.ProductCollection = this.ProductDatabase.collection("CTHoaDon");
        this.ProductTypeCollection = this.ProductDatabase.collection("SP");
        this.AdminCollection = this.ProductDatabase.collection("Admin");
    }
    
        async deleteProduct(id){
        return await this.ProductCollection.deleteOne({"_id": new ObjectId(id)
        });
         }
         async updateProduct(product){
         return await this.ProductCollection.updateOne({"_id": new
        ObjectId(product._id) }, {$set: product});
         }
         async insertProduct(product){
         return await this.ProductCollection.insertOne(product);
         }
         async getProduct(id){
         return await this.ProductCollection.findOne({"_id": new ObjectId(id)
        },{});
         }
         async getProductList(pageNumber, pageSize) {
            const skipIndex = (pageNumber - 1) * pageSize;
            const cursor = await this.ProductCollection.find({}, {}).skip(skipIndex).limit(pageSize);
            return await cursor.toArray();
          }
          
          async getProductCount() {
            const count = await this.ProductCollection.countDocuments({});
            return count;
          }
          
        
         async getUserById(id) {
            try {
                const objectId = new ObjectId(id);
                const product = await this.ProductCollection.findOne({ _id: objectId });
                return product;
            } catch (error) {
                throw error;
            }
        }
        
        async updateUser(product) {
            try {
                const result = await this.ProductCollection.updateOne({ _id: new ObjectId(product._id) }, { $set: product });
                return result;
            } catch (error) {
                throw error;
            }
        }
        
        
        async getProductTypes() {
            const cursor = await this.ProductTypeCollection.find({});
            return await cursor.toArray();
        }
        async loginUser(taikhoan, matkhau) {
            try {
                
                const user = await this.AdminCollection.findOne({ taikhoan });
                if (!user) {
                    return { success: false, message: 'User not found' };
                }
                if (user.matkhau !== matkhau) {
                    return { success: false, message: 'Incorrect password' };
                }
                return { success: true, role: user.quyen ? 'admin' : 'user' };
            } catch (err) {
                console.error(err);
                return { success: false, message: 'An error occurred while logging in' };
            }
        }
        
        }

        
module.exports = CTGioHangService;
