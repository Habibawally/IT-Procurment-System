const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const { UPLOAD_DIR } = require('../config');
const {
  getRequests, getRequest, createRequest,
  approveRequest, rejectRequest, completeRequest, getDeliveryImage, getStats
} = require('../controllers/requestController');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// The file extension comes from the validated MIME type, never from the client's filename.
const IMAGE_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${IMAGE_TYPES[file.mimetype]}`)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error('Only JPEG, PNG, GIF or WebP images are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }
});

// Turn upload errors into a 400 JSON response instead of a generic 500.
function uploadDeliveryImage(req, res, next) {
  upload.single('delivery_image')(req, res, err => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 10 MB)' : err.message;
    res.status(400).json({ error: message });
  });
}

router.get('/stats', authenticate, getStats);
router.get('/', authenticate, getRequests);
router.get('/:id', authenticate, getRequest);
router.get('/:id/delivery-image', authenticate, getDeliveryImage);
router.post('/', authenticate, authorize('employee'), createRequest);
router.post('/:id/approve', authenticate, authorize('manager', 'it'), approveRequest);
router.post('/:id/reject', authenticate, authorize('manager', 'it'), rejectRequest);
router.post('/:id/complete', authenticate, authorize('procurement'), uploadDeliveryImage, completeRequest);

module.exports = router;
