const Product = require("../models/Product");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");
const { clearCacheByPattern } = require("../middlewares/cache.middleware");

// Thêm sản phẩm
exports.createProduct = catchAsync(async (req, res, next) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    image: req.file ? req.file.filename : null
  });

  await product.save();
  
  logger.info('Product created', { productId: product._id, name: product.name });
  
  // Clear product cache
  clearCacheByPattern('products');
  clearCacheByPattern('cache_/api/products');

  res.status(201).json({
    message: "Thêm sản phẩm thành công",
    product
  });
});

// Lấy danh sách sản phẩm với search & filter nâng cao
exports.getProducts = catchAsync(async (req, res, next) => {
  const { 
    search, 
    category, 
    minPrice, 
    maxPrice, 
    inStock, 
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 100
  } = req.query;

  // Build query filter
  let filter = {};

  // Search theo tên hoặc description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // Filter theo category
  if (category && category !== "all") {
    filter.category = category;
  }

  // Filter theo price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Filter theo stock
  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (inStock === "false") {
    filter.stock = 0;
  }

  // Build sort object
  let sortObj = {};
  if (sortBy === "price") {
    sortObj.price = order === "asc" ? 1 : -1;
  } else if (sortBy === "name") {
    sortObj.name = order === "asc" ? 1 : -1;
  } else if (sortBy === "stock") {
    sortObj.stock = order === "asc" ? 1 : -1;
  } else {
    sortObj.createdAt = order === "asc" ? 1 : -1;
  }

  // Execute query với pagination (optimized with lean)
  const skip = (Number(page) - 1) * Number(limit);
  const products = await Product.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .lean() // Optimize: return plain JS objects
    .select('-__v'); // Exclude version key

  const total = await Product.countDocuments(filter);

  res.json({
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    hasMore: skip + products.length < total
  });
});

// Lấy 1 sản phẩm theo id
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .lean()
    .select('-__v');
  
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }
  
  res.json(product);
});

// Cập nhật sản phẩm
exports.updateProduct = catchAsync(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
  };
  
  if (req.file) updateData.image = req.file.filename;
  
  if (req.body.discount) {
    try {
      updateData.discount = JSON.parse(req.body.discount);
    } catch (e) {
      updateData.discount = req.body.discount;
    }
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    updateData, 
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }
  
  logger.info('Product updated', { productId: product._id, name: product.name });
  
  // Clear product cache
  clearCacheByPattern('products');
  clearCacheByPattern(`cache_/api/products/${req.params.id}`);
  
  res.json({ message: "Cập nhật sản phẩm thành công", product });
});

// Xóa sản phẩm
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }
  
  logger.info('Product deleted', { productId: req.params.id });
  
  // Clear product cache
  clearCacheByPattern('products');
  clearCacheByPattern(`cache_/api/products/${req.params.id}`);
  
  res.json({ message: "Xóa sản phẩm thành công" });
});
