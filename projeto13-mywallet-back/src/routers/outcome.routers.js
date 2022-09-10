import express from 'express';
import { outcome } from "../controllers/outcome.controller.js";
import authorizationUser from '../middlewares/authorizationUser.middleware.js';
const router = express.Router();

router.use(authorizationUser);
router.put('/outcome', outcome);

export default router;