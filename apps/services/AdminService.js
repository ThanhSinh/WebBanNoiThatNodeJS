const { ObjectId } = require('mongodb');


const jsonwebtoken = require('jsonwebtoken');

var config = require("../../config/setting.json");
class ProductService{
    databaseConnection = require('../database/database');
    product = require('../models/KhachHang');

    client;
    ProductDatabase;
    ProductCollection;
    constructor(){
        this.client = this.databaseConnection.getMongoClient();
        this.ProductDatabase =  this.client.db(config.mongodb.database);
        this.ProductCollection = this.ProductDatabase.collection("KhachHang");
       
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
        
        
          
        async loginUser(taikhoan, matKhau) {
            try {
              const user = await this.ProductCollection.findOne({ taikhoan: taikhoan, matKhau: matKhau });
              if (user) {
                return { success: true, message: "Đăng nhập thành công", id: user._id, hoTen: user.hoTen, diaChi: user.diaChi, soDienThoai: user.soDienThoai, GioiTinh: user.GioiTinh };
              } else {
                return { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" };
              }
            } catch (error) {
              console.log(error);
              return { success: false, message: "Có lỗi xảy ra khi đăng nhập, vui lòng thử lại sau" };
            }
          }
          
        
        }

        
module.exports = ProductService;
