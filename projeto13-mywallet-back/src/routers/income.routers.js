import express from 'express';
import { income } from "../controllers/income.controller.js";
import authorizationUser from '../middlewares/authorizationUser.middleware.js';
const router = express.Router();

router.use(authorizationUser);
router.put('/income', income);

export default router;