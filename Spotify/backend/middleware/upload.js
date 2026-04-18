const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'soundsphere/audio',
    resource_type: 'video', // Cloudinary uses 'video' for audio files
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
    format: 'mp3',
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'soundsphere/covers',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'center' }],
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files allowed'), false);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  },
});

module.exports = { cloudinary, uploadAudio, uploadImage };
