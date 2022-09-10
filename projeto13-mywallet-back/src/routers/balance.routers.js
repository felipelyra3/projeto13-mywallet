import express from 'express';
import { balance } from "../controllers/balance.controller.js";
const router = express.Router();

router.get('/balance', balance);

export default router;