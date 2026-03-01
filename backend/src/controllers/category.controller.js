const Category = require("../models/Category");
const { catchAsync, AppError } = require("../middlewares/errorHandler.middleware");
const logger = require("../config/logger");
const { clearCacheByPattern } = require("../middlewares/cache.middleware");

// Lấy tất cả danh mục
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find()
    .sort({ name: 1 })
    .lean()
    .select('-__v');
  
  res.json(categories);
});

// Tạo danh mục mới
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon } = req.body;
  
  if (!name) {
    return next(new AppError('Tên danh mục không được để trống', 400));
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new AppError('Danh mục đã tồn tại', 400));
  }

  // Tạo slug từ name
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const category = new Category({ name, description, icon, slug });
  await category.save();

  logger.info('Category created', { categoryId: category._id, name });
  
  // Clear cache
  clearCacheByPattern('categories');

  res.status(201).json({ message: "Tạo danh mục thành công", category });
});

// Cập nhật danh mục
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon } = req.body;
  
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, icon },
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError('Không tìm thấy danh mục', 404));
  }

  logger.info('Category updated', { categoryId: category._id, name });
  
  // Clear cache
  clearCacheByPattern('categories');

  res.json({ message: "Cập nhật danh mục thành công", category });
});

// Xóa danh mục
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  
  if (!category) {
    return next(new AppError('Không tìm thấy danh mục', 404));
  }

  logger.info('Category deleted', { categoryId: req.params.id });
  
  // Clear cache
  clearCacheByPattern('categories');

  res.json({ message: "Xóa danh mục thành công" });
});
