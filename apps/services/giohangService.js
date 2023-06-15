const { ObjectId } = require('mongodb');


const jsonwebtoken = require('jsonwebtoken');

var config = require("../../config/setting.json");
class ProductService{
    databaseConnection = require('../database/database');
    product = require('../models/GioHang');
    CTGioHang = require('../models/CTGioHang');
    SanPham = require('../models/product');
    KH = require('../models/KhachHang');
    client;
    ProductDatabase;
    ProductCollection;
    KHCollection;
    CTGioHangCollection;
    SanPhamCollection;
    constructor(){
        this.client = this.databaseConnection.getMongoClient();
        this.ProductDatabase =  this.client.db(config.mongodb.database);
        this.ProductCollection = this.ProductDatabase.collection("HoaDon");
        this.KHCollection = this.ProductDatabase.collection("KhachHang");
        this.CTGioHangCollection = this.ProductDatabase.collection("CTHoaDon");
        this.SanPhamCollection = this.ProductDatabase.collection("SP");
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
          async getProductById(id) {
            try {
                const objectId = new ObjectId(id);
                const product = await this.ProductCollection.findOne({ _id: objectId });
                return product;
            } catch (error) {
                throw error;
            }
        }
        
        async getSanPhamById(id) {
          try {
              const objectId = new ObjectId(id);
              const product = await this.SanPhamCollection.findOne({ _id: objectId });
              return product;
          } catch (error) {
              throw error;
          }
      }
        
        
        async getKH() {
            const cursor = await this.KHCollection.find({});
            return await cursor.toArray();
        }
        
        async getCTGioHangByGioHangId(id) {
            try {
              const objectId = new ObjectId(id);
              const ctGioHangList = await this.CTGioHangCollection.find({ HoaDon_id: objectId }).toArray();
              return ctGioHangList;
            } catch (error) {
              throw error;
            }
          }

          async getCTGioHangByGioHangId(id) {
            try {
              const objectId = new ObjectId(id);
              const ctGioHangList = await this.CTGioHangCollection.find({ HoaDon_id: objectId }).toArray();
              return ctGioHangList;
            } catch (error) {
              throw error;
            }
          }
          async getSanPhamByCTGioHangId(id) {
            try {
              const objectId = new ObjectId(id);
              const SPList = await this.SanPhamCollection.find({ SP_id: objectId }).toArray();
              return SPList;
            } catch (error) {
              throw error;
            }
          }
        
       
        
        }

        
module.exports = ProductService;
