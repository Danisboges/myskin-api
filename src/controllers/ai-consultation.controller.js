const aiConsultationService = require('../services/ai-consultation.service');

const getErrorStatusCode = (error) => {
  if (error.message.includes('not found')) {
    return 404;
  }

  if (error.message.includes('Unauthorized')) {
    return 403;
  }

  if (
    error.message.includes('required') ||
    error.message.includes('cannot be') ||
    error.message.includes('must be')
  ) {
    return 400;
  }

  if (error.message.includes('closed')) {
    return 409;
  }

  if (error.message.includes('AI chatbot service is unavailable')) {
    return 503;
  }

  return 500;
};

const getChatHistory = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user.id;

    const chatHistory = await aiConsultationService.getAiChatHistory(userId, consultationId);

    return res.status(200).json({
      status: 'success',
      data: chatHistory
    });
  } catch (error) {
    console.error('Error getting AI chat history:', error.message);

    return res.status(getErrorStatusCode(error)).json({
      status: 'error',
      message: error.message
    });
  }
};

const sendMessageToAi = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user.id;
    const messageContent = req.body.message;

    const aiMessage = await aiConsultationService.sendAiMessage(
      userId,
      consultationId,
      messageContent
    );

    return res.status(201).json({
      status: 'success',
      data: aiMessage
    });
  } catch (error) {
    console.error('Error sending message to AI:', error.message);

    return res.status(getErrorStatusCode(error)).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessageToAi
};
