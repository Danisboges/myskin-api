const express = require('express');
const router = express.Router();
const aiConsultationController = require('../controllers/ai-consultation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get(
  '/:consultationId/messages',
  verifyToken,
  aiConsultationController.getChatHistory
);

router.post(
  '/:consultationId/messages',
  verifyToken,
  aiConsultationController.sendMessageToAi
);

module.exports = router;
