import express from 'express';
import { signUp } from "../controllers/signup.controller.js";
const router = express.Router();

router.post('/signup', signUp);

export default router;