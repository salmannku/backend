import { Request, Router } from 'express';
import { bulkUploadMiddleware, dowloadSamples, exportHandle, handleBulkUpload } from '../../controllers/admin/people-bulk-uploads.controller';
import { authenticateRequests } from '../../middlewares/authenticateRequest.middleware';

const router = Router()

router.post('/upload', authenticateRequests, bulkUploadMiddleware, handleBulkUpload);
router.post('/export', authenticateRequests, exportHandle);
// router.post(
//   `/upload`,
//   // authenticateRequests,
//   upload.single('file'),
//   peopleBulkUpload.parse
// )

router.get('/download', authenticateRequests, dowloadSamples);
const Peoplebulkupload = router

export default Peoplebulkupload
