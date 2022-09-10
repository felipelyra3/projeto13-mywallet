import express from 'express';
import { outcome } from "../controllers/outcome.controller.js";
const router = express.Router();

router.put('/outcome', outcome);

export default router;