var express = require("express");


const { ObjectId } = require("mongodb");
var router = express.Router();
var product = require("../models/product");
const GioHang = require("../models/GioHang");
var loaisp = require("../models/productType");
var kh = require("../models/KhachHang");
var Admin = require("../models/Admin");
//jwt
const jsonwebtoken = require("jsonwebtoken");
const jwtExpirySeconds = 300
var config = require('../../config/setting.json');
var verifyToken = require("../util/VerifyToken");
const ProductService = require("../services/productService");
const AdminService = require("../services/AdminService");
const GiohangService = require("../services/giohangService");
const KHService = require("../services/khService");
const CTGiohangService = require("../services/CTGioHangService");
const CTGioHang = require("../models/CTGioHang");
const moment = require('moment');


// Middleware to verify token and authorize user
var verifyTokenAndAuthorize = function(req, res, next) {
  try {
    const user = jsonwebtoken.verify(req.cookies.token, config.jwt.secret);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send('Unauthorized');
  }
};
//user-----------------------------------------------------------------------------------------------------------
//Home
router.get('/', async function(req, res) {
  const productService = new ProductService();
  const perPage = 20;
  const page = parseInt(req.query.page) || 1;
  const products = await productService.getProductList(page, perPage);
  const totalProducts = await productService.getProductCount();
  const totalPages = Math.ceil(totalProducts / perPage);
  const username = req.cookies.username;
  const ten = req.cookies.ten;
  const customerId = req.cookies.customerId;

  // Define the productTypes variable in the current scope
  let productTypes;
  try {
    productTypes = await productService.getProductTypes();
  } catch (error) {
    console.error(error);
  }

  // Replace product type ID with its name if productTypes is defined
  if (productTypes) {
    products.forEach(product => {
      const productType = productTypes.find(type => type._id.toString() === product.LoaiSP_id);
      if (productType) {
        product.LoaiSP = productType.tenloai;
      }
    });
  }

  res.render('./user/index.ejs', {
    products: products,
    productTypes: productTypes,
    totalPages: totalPages,
    currentPage: page,
    username: username,
    customerId: customerId,
    ten: ten,
    activePage: '/'
  });
});



  //shop-------------------------------------------------------------------------------------------------------
  router.get("/shop", async function(req, res) {
  
     
        const productService = new ProductService();
        const perPage = 4;
        const page = parseInt(req.query.page) || 1;
        const productTypeId = req.query.type;
        const products = await productService.getProductList(page, perPage, productTypeId);
        
        const productTypes = await productService.getProductTypes();
        // Replace product type ID with its name
        products.forEach(product => {
          const productType = productTypes.find(type => type._id.toString() === product.LoaiSP_id);
          if (productType) {
            product.LoaiSP = productType.tenloai;
          }
        });
        const totalProducts = await productService.getProductCount();
        const totalPages = Math.ceil(totalProducts / perPage);
        const username = req.cookies.username; // Lấy tên đăng nhập từ cookie
        const ten = req.cookies.ten; // Lấy tên đăng nhập từ cookie
        const customerId = req.cookies.customerId; // Lấy id khách hàng từ cookie
        res.render("./user/shop.ejs", {
          productTypeId: productTypeId,
          products: products,
          productTypes: productTypes,
          totalPages: totalPages,
          currentPage: page,
          username: username,
          ten:ten, // Truyền tên đăng nhập cho view
          customerId: customerId,
          activePage: '/shop'
           // Truyền tên đăng nhập cho view
        });
      
    });


    // Tìm kiếm sản phẩm-----------------------------------------------------------
    
   


    
    // Define a route handler for the search endpoint
    router.get('/search', async (req, res) => {
      const productService = new ProductService();
      const perPage = 5;
      const page = parseInt(req.query.page) || 1;
      const query = req.query.q;
      const products = await productService.searchProducts(query, page, perPage);
      const totalProducts = await productService.getProductCount();
      const totalPages = Math.ceil(totalProducts / perPage);
      const username = req.cookies.username;
      const ten = req.cookies.ten;
      const customerId = req.cookies.customerId;
    
      res.render('./user/index.ejs', {
        products: products,
        totalPages: totalPages,
        currentPage: page,
        username: username,
        customerId: customerId,
        ten: ten,
        query: query,
        activePage: ''// Pass the search query to the view
      });
    });
    
    
    

    
      
      
      
      
      
    //chi tiet san pham ----------------------------------------------------------------------------------------
    router.get("/cart/:id", async function(req,res){
      try {
        const productService = new ProductService();
        const user = await productService.getUserById(req.params.id);
        const username = req.cookies.username; // Lấy giá trị của biến username từ cookie
        const ten = req.cookies.ten; // Lấy tên đăng nhập từ cookie
        const customerId = req.cookies.customerId; // Lấy id khách hàng từ cookie
        res.render("./user/product-details.ejs", { 
          user: user, 
          username: username,
          ten:ten,
          customerId:customerId,  
          activePage: '/cart/:id' }); // Truyền giá trị của biến username vào view
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      }
    });

  
    
    //hienthi===========================
   
    var cart = [];

    router.get("/cart-show/", function(req, res) {
      if (cart.length === 0) {
        res.redirect('/');
      } else {
        const total = cart.reduce((sum, item) => sum + item.product.Gia * item.quantity, 0);
        const username = req.cookies.username; // Lấy giá trị của biến username từ cookie
        const ten = req.cookies.ten; // Lấy tên đăng nhập từ cookie
        const customerId = req.cookies.customerId; // Lấy id khách hàng từ cookie
        res.render('./user/cart.ejs', { 
          cart: cart, 
          total: total, 
          username: username,
          ten:ten,
          customerId:customerId,
        
          activePage: '/cart-show'
        
        });
      }
    });
 
    

    router.get("/cart-add/:id", async function(req, res) {
      var productService = new ProductService();
      var productId = req.params.id;
      var product = await productService.getProductById(productId);
    
      if (!product) {
        res.send('Không tìm thấy sản phẩm');
        return;
      }
    
      var quantity = parseInt(req.query.quantity); // Get the quantity from user input
      if (!quantity || quantity <= 0) {
        quantity = 1; // Set quantity to 1 if it's not valid or not provided
      }
    
      const cartItem = cart.find(item => item.product._id == productId);
    
      if (cartItem) {
        cartItem.quantity += quantity; // Add the new quantity to the existing quantity
      } else {
        cart.push({ product: product, quantity: quantity });
      }
    
      console.log("Cart:", cart);
    
      const total = cart.reduce((sum, item) => sum + item.product.Gia * item.quantity, 0);
    
      console.log(`Quantity of product ${productId} in cart: ${quantity}`);
    
      res.redirect('/cart-show/');
    });
    

router.get("/checkout", async function(req, res) {
  if (cart.length === 0) {
    res.redirect('/');
  } else {
    var userID = req.userID;
    var khService = new KHService();
    const username = req.cookies.username; // Lấy giá trị của biến username từ cookie
    const ten = req.cookies.ten;
    const sdt = req.cookies.sdt;
    const diachi = req.cookies.diachi;
    const gioitinh = req.cookies.gioitinh; // Lấy tên đăng nhập từ cookie
    var userData = await khService.getProduct(userID);
    const total = cart.reduce((sum, item) => sum + item.product.Gia * item.quantity, 0);
    

    res.render('./user/checkout.ejs', { 
      userData: userData, 
      cart: cart, 
      total: total, 
      username: username,
      ten:ten,
      sdt: sdt,
      diachi: diachi,
      gioitinh: gioitinh,
      activePage: '/checkout'
    });
  }
});
router.post("/order", async function(req, res){
  const customerId = req.cookies.customerId;
  
  var giohangService = new GiohangService();
  var ctgiohangService = new CTGiohangService();
  var newCart = new GioHang();
  newCart.KhachHang_id = customerId;
  newCart.tongtien = cart.reduce((sum, item) => sum + item.product.Gia * item.quantity, 0);
  newCart.ngaydat = moment().format('YYYY-MM-DD');
  newCart.ghichu = req.body.ghichu;
  newCart.tinhtrang = "Dang xu ly";
  
  var result = await giohangService.insertProduct(newCart);
  var getCart = await giohangService.getProductById(result.insertedId);
  for(i = 0; i < cart.length; i++){
    var addCartDetail = new CTGioHang();
    addCartDetail.HoaDon_id = getCart._id;
    addCartDetail.SP_id = cart[i].product._id;
    addCartDetail.quantity = cart[i].quantity;
    var result_cartdetail = await ctgiohangService.insertProduct(addCartDetail);
  }
  cart = [];
  res.redirect('/');
  
});


    //Gio Hang---------------------------------------------------------------------------------
    

    
    
    
//admin--------------------------------------------------------------------------------------------------------------------------------
//list san pham==================================================================================================
router.get("/SP-list", async function(req, res) {
  const productService = new ProductService();
  const perPage = 5;
  const page = parseInt(req.query.page) || 1;
  const products = await productService.getProductList(page, perPage);

  // Retrieve the product types and manufacturers
  const productTypes = await productService.getProductTypes();
  const hsx = await productService.getHSX();

  // Add productType and productTypeName to each product in the products array
  for (let i = 0; i < products.length; i++) {
    const productType = productTypes.find(pt => pt._id.toString() === products[i].LoaiSP_id);
    const productTypeName = productType ? productType.tenloai : '';
    products[i].productTypeName = productTypeName;
  
    const manufacturer = hsx.find(hsx => hsx._id.toString() === products[i].HangSanXuat_id);
    const manufacturerName = manufacturer ? manufacturer.TenHang : '';
    products[i].manufacturerName = manufacturerName;
  }

  const productTypeList = await productService.getProductTypeList();
  const totalProducts = await productService.getProductCount();
  const totalPages = Math.ceil(totalProducts / perPage);

  res.render("./admin/SP-list.ejs", {
    productTypeList: productTypeList,
    products: products,
    totalPages: totalPages,
    currentPage: page,
    productTypes: productTypes,
    hsx: hsx,
    activePage: '/SP-list'
  });
});











//list loai sản phẩm=====================================================================================
router.get("/LoaiSP-list", async function(req,res){
    const productService = new ProductService();
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;
    const producttypes = await productService.getProductTypeList(page, perPage);

   
    const isAdmin = req.user && req.user.quyen === "admin";
    const totalProducts = await productService.getProductTypeCount();
    const totalPages = Math.ceil(totalProducts / perPage);
    res.render("./admin/loaisp.ejs", {
      producttypes: producttypes,
      quyen: isAdmin,
      totalPages: totalPages,
      currentPage: page,
      activePage: '/SP-list'
    });
    
 
});

//them san pham
router.get("/add-product", function(req,res){
  res.render("./admin/add-product.ejs",{ activePage: '/SP-list' });
});

router.post("/add-product", async function(req, res){
  try {
    const productService = new ProductService();
    
    const newProduct = new product();
    newProduct.TenSP = req.body.TenSP;
    newProduct.LoaiSP_id = req.body.LoaiSP_id;
    newProduct.HangSanXuat_id = req.body.HangSanXuat_id;
    newProduct.Mota = req.body.Mota;
    newProduct.soluong = req.body.soluong;
    newProduct.Gia = req.body.Gia;

    
      newProduct.hinhanh = req.body.hinhanh;
      newProduct.hinhanh2 = req.body.hinhanh2;
      newProduct.hinhanh3 = req.body.hinhanh3;
      newProduct.hinhanh3D = req.body.hinhanh3D;
    
    
    const result = await productService.insertProduct(newProduct);
    res.redirect("/product/SP-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


// phuong thuc sua

router.get("/edit/:id", async function(req,res){
  try {
    const productService = new ProductService();
    const product = await productService.getProductById(req.params.id);
    res.render("./admin/edit-product.ejs", { product: product,activePage: '/SP-list' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


router.post("/edit/:id", async function(req,res){
  try {
    const productService = new ProductService();
    const product = await productService.getProductById(req.params.id);
    product.TenSP = req.body.TenSP;
    product.LoaiSP_id = req.body.LoaiSP_id;
    product.HangSanXuat_id = req.body.HangSanXuat_id;
    product.Mota = req.body.Mota;
    product.soluong = req.body.soluong;
    product.Gia = req.body.Gia;
    product.hinhanh = req.body.hinhanh;
    product.hinhanh2 = req.body.hinhanh2;
    product.hinhanh3 = req.body.hinhanh3;
    product.hinhanh3D = req.body.hinhanh3D;
   
    const result = await productService.updateUser(product); // Corrected parameter
    res.redirect("/product/SP-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/login",async function(req,res){
  res.render("./user/login.ejs", { message: "" });
});


router.post("/login", async function(req, res) {
  const { taikhoan, matKhau } = req.body;

  var khService = new KHService();
  var user = await khService.loginUser(taikhoan, matKhau);

  if (user.success) {
    const token = jsonwebtoken.sign(
      { userId: user._id, quyen: user.quyen },
      config.jwt.secret,
      { expiresIn: jwtExpirySeconds }
    );
    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('username', taikhoan, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('customerId', user.id, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('ten', user.hoTen, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('sdt', user.soDienThoai, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('diachi', user.diaChi, { maxAge: jwtExpirySeconds * 1000 });
    res.cookie('gioitinh', user.GioiTinh, { maxAge: jwtExpirySeconds * 1000 });
    const productService = new ProductService();
    const perPage = 10; // Define the number of products to show per page
    const page = req.query.page || 1; // Get the current page from the query string or default to page 1
    const products = await productService.getProductList(page, perPage);
   
    res.render("./user/index.ejs", {
      ten: user.hoTen, 
      sdt: user.soDienThoai,
      diachi: user.diaChi,
      gioitinh: user.GioiTinh,
      customerId: user.id, 
      username: taikhoan, 
      products: products, 
      currentPage: page,  
      activePage: '',
      message: user.message });

  }
  console.log(req.cookies);
});

router.get("/forget", function(req,res){
  res.render("./user/forget.ejs");
});


router.post("/forget", async function(req, res){
  try {
    const khService = new KHService();
    const newkh = new kh();
    newkh.hoTen = req.body.hoTen;
    newkh.soDienThoai = req.body.soDienThoai;
    newkh.taikhoan = req.body.taikhoan;
    newkh.matKhau = req.body.matKhau;
    newkh.diaChi = req.body.diaChi;
    newkh.GioiTinh = req.body.GioiTinh;
    const result = await khService.insertProduct(newkh);
    res.redirect("/product/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/product/logout", function(req, res) {
  res.clearCookie("token");
  res.redirect("/login");
});
//xóa
router.post("/delete/:id", async function(req, res) {
  try {
    const productService = new ProductService();
    const result = await productService.deleteProduct(req.params.id);
    res.redirect("/product/SP-list");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

//login admin==========================================

router.get("/loginAdmin",async function(req,res){
  res.render("./admin/loginAdmin.ejs", { message: "" });
});

router.post("/loginAdmin", async function(req, res) {
  const { taikhoan, matKhau } = req.body;

  var khService = new AdminService();
  var user = await khService.loginUser(taikhoan, matKhau);

  if (user.success) {
    const productService = new ProductService();
    const perPage = 10; // Define the number of products to show per page
    const page = req.query.page || 1; // Get the current page from the query string or default to page 1
    const products = await productService.getProductList(page, perPage);
   
    res.render("./user/index.ejs", {
      products: products, 
      currentPage: page,  
      activePage: '',
      message: user.message });

  }
  console.log(req.cookies);
});

module.exports = router;
