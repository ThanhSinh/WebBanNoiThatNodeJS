const { ObjectId } = require('mongodb');


const jsonwebtoken = require('jsonwebtoken');

var config = require("../../config/setting.json");
class ProductService{
    databaseConnection = require('../database/database');
    product = require('../models/product');
    productType = require('../models/productType');
    
    
    client;
    ProductDatabase;
    ProductCollection;
    ProductTypeCollection;
    HSXCollection;
    constructor(){
        this.client = this.databaseConnection.getMongoClient();
        this.ProductDatabase =  this.client.db(config.mongodb.database);
        this.ProductCollection = this.ProductDatabase.collection("SP");
        this.ProductTypeCollection = this.ProductDatabase.collection("LoaiSP");
        this.HSXCollection = this.ProductDatabase.collection("HangSanXuat");
        
       
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
         async  getProductList(pageNumber, pageSize, productTypeId) {
           
              const skipIndex = (pageNumber - 1) * pageSize;
              const filters = productTypeId ? { LoaiSP_id: productTypeId } : {};
              const products = await this.ProductCollection.find(filters).skip(skipIndex).limit(pageSize).toArray();
              return products;
            
          }
          
          async getProductTypeList(pageNumber, pageSize) {
            const skipIndex = (pageNumber - 1) * pageSize;
            const products = await this.ProductTypeCollection.find({}, {}).skip(skipIndex).toArray();    
            return products;
          }

         
            //...
            async searchProducts(query, page, perPage) {
                const regex = new RegExp(query, 'i');
                const products = await this.ProductCollection
                .find({ $or: [{ TenSP: regex }, { Mota: regex }] })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .toArray(); 
                return products;
              }
              
              
         
          
          async getProductCount() {
            const count = await this.ProductCollection.countDocuments({});
            return count;
          }

          async getProductTypeCount() {
            const count = await this.ProductTypeCollection.countDocuments({});
            return count;
          }
          
          async getProductTypes() {
            const cursor = await this.ProductTypeCollection.find({});
            return await cursor.toArray();
        }
        async getHSX() {
            const cursor = await this.HSXCollection.find({});
            return await cursor.toArray();
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
        async getProductById(id) {
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
        
        async getProductListByType(typeId, page, perPage) {
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const products = await this.productModel.find({ LoaiSP_id: typeId }).sort({ _id: -1 }).skip(startIndex).limit(perPage).lean().exec();
            return products;
          }
        
          
            async getProductCountByType(typeId) {
              const count = await this.productModel.countDocuments({ LoaiSP_id: typeId });
              return count;
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

        
module.exports = ProductService;
