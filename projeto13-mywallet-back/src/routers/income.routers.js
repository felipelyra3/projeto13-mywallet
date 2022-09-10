import express from 'express';
import { income } from "../controllers/income.controller.js";
const router = express.Router();

router.put('/income', income);

export default router;