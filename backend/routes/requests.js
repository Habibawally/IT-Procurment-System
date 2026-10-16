const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRequests, getRequest, createRequest,
  approveRequest, rejectRequest, completeRequest, getStats
} = require('../controllers/requestController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/stats', authenticate, getStats);
router.get('/', authenticate, getRequests);
router.get('/:id', authenticate, getRequest);
router.post('/', authenticate, authorize('employee'), createRequest);
router.post('/:id/approve', authenticate, authorize('manager', 'it'), approveRequest);
router.post('/:id/reject', authenticate, authorize('manager', 'it'), rejectRequest);
router.post('/:id/complete', authenticate, authorize('procurement'), upload.single('delivery_image'), completeRequest);

module.exports = router;