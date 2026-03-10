const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = req.file.filename;
    const filepath = req.file.path;
    const fileExt = path.extname(filename).toLowerCase();
    
    // Only process images
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
      return next();
    }

    // Create optimized filename
    const optimizedFilename = `optimized-${Date.now()}${fileExt}`;
    const optimizedPath = path.join(path.dirname(filepath), optimizedFilename);

    // Optimize image with sharp
    await sharp(filepath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 8 })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(filepath);

    // Update req.file with optimized file info
    req.file.filename = optimizedFilename;
    req.file.path = optimizedPath;

    const stats = await fs.stat(optimizedPath);
    req.file.size = stats.size;

    console.log(`✅ Image optimized: ${filename} -> ${optimizedFilename}`);
    
    next();
  } catch (error) {
    console.error('❌ Image optimization error:', error);
    // Continue without optimization if error occurs
    next();
  }
};

// Create thumbnail middleware
const createThumbnail = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = req.file.filename;
    const filepath = req.file.path;
    const fileExt = path.extname(filename).toLowerCase();
    
    // Only process images
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
      return next();
    }

    // Create thumbnail filename
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailPath = path.join(path.dirname(filepath), thumbnailFilename);

    // Create thumbnail with sharp
    await sharp(filepath)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .png({ compressionLevel: 8 })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Add thumbnail info to req
    req.thumbnail = {
      filename: thumbnailFilename,
      path: thumbnailPath
    };

    console.log(`✅ Thumbnail created: ${thumbnailFilename}`);
    
    next();
  } catch (error) {
    console.error('❌ Thumbnail creation error:', error);
    // Continue without thumbnail if error occurs
    next();
  }
};

module.exports = {
  optimizeImage,
  createThumbnail
};
