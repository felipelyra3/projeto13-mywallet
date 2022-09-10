import express from 'express';
import { balance } from "../controllers/balance.controller.js";
import authorizationUser from '../middlewares/authorizationUser.middleware.js';
const router = express.Router();

router.use(authorizationUser);
router.get('/balance', balance);

export default router;