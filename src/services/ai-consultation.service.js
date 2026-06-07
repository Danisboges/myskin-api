const ollamaPackage = require('ollama');
const prisma = require('../config/prisma');
const { publishConsultationEvent } = require('../services/consultation-events.service');

const ollama = ollamaPackage.default || ollamaPackage;
const AI_BOT_NAME = 'Gemma AI';
const AI_MODEL = 'gemma2';

const mapChatMessage = (chatMessage) => ({
  id: chatMessage.id,
  message: chatMessage.message,
  sender: chatMessage.sender
    ? {
      id: chatMessage.sender.id,
      name: chatMessage.sender.name,
      role: chatMessage.sender.role,
      avatarUrl: chatMessage.sender.avatarUrl
    }
    : null,
  senderId: chatMessage.senderId,
  senderRole: chatMessage.sender?.role || null,
  timestamp: chatMessage.timestamp,
  createdAt: chatMessage.timestamp,
  consultationId: chatMessage.consultationId
});

const validatePatientConsultation = (consultation, userId) => {
  if (!consultation) {
    throw new Error('Consultation not found');
  }

  if (consultation.patientId !== userId) {
    throw new Error('Unauthorized: You are not allowed to access this AI consultation');
  }
};

const validateAiConsultation = (consultation) => {
  if (process.env.AI_BOT_USER_ID && consultation.doctorId !== process.env.AI_BOT_USER_ID) {
    throw new Error('Unauthorized: This consultation is not assigned to Gemma AI');
  }
};

const getAiBotUserId = (consultation) => {
  return process.env.AI_BOT_USER_ID || consultation.doctorId;
};

const formatConfidence = (confidence) => {
  if (typeof confidence !== 'number') {
    return 'Tidak tersedia';
  }

  return confidence <= 1
    ? `${Math.round(confidence * 100)}%`
    : `${Math.round(confidence)}%`;
};

const buildSystemPrompt = (scan = {}) => {
  const complaint = scan.complaint || 'Tidak ada keluhan yang dicatat';
  const result = scan.aiPrediction || 'Belum tersedia';
  const confidence = formatConfidence(scan.aiConfidence);
  const bodySite = scan.bodySite || 'Tidak disebutkan';
  const aiDetails = scan.aiDetails || 'Tidak ada detail tambahan';

  return [
    'Anda adalah Gemma AI, asisten konsultasi awal untuk aplikasi MySkin.',
    'Bantu pasien memahami hasil scan kulit mereka dengan bahasa Indonesia yang tenang, jelas, dan mudah dipahami.',
    '',
    'Konteks hasil scan pasien:',
    `- Keluhan: ${complaint}`,
    `- Lokasi lesi: ${bodySite}`,
    `- Hasil analisis AI: ${result}`,
    `- Confidence: ${confidence}`,
    `- Detail tambahan: ${aiDetails}`,
    '',
    'Aturan jawaban:',
    '- Jangan menyatakan diagnosis final atau menggantikan dokter.',
    '- Jelaskan bahwa hasil AI adalah bantuan skrining awal dan tetap perlu konfirmasi tenaga medis.',
    '- Berikan edukasi umum, langkah aman berikutnya, dan tanda bahaya yang perlu segera diperiksakan.',
    '- Jika pasien menanyakan obat, tindakan invasif, atau keputusan klinis pasti, arahkan untuk konsultasi dokter.',
    '- Jawab ringkas, empatik, dan relevan dengan konteks scan di atas.'
  ].join('\n');
};

const getAiChatHistory = async (userId, consultationId) => {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId }
  });

  validatePatientConsultation(consultation, userId);
  validateAiConsultation(consultation);

  const messages = await prisma.chatMessage.findMany({
    where: { consultationId },
    orderBy: { timestamp: 'asc' },
    include: {
      sender: { select: { id: true, name: true, role: true, avatarUrl: true } }
    }
  });

  return messages.map(mapChatMessage);
};

const sendAiMessage = async (userId, consultationId, messageContent) => {
  const message = (messageContent || '').trim();

  if (!message) {
    throw new Error('Message is required');
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      scan: true
    }
  });

  validatePatientConsultation(consultation, userId);
  validateAiConsultation(consultation);

  if (consultation.status !== 'OPEN') {
    throw new Error('Cannot send messages in a closed consultation');
  }

  const aiBotUserId = getAiBotUserId(consultation);

  const userMessage = await prisma.chatMessage.create({
    data: {
      consultationId,
      senderId: userId,
      message,
      timestamp: new Date(),
      readReceipts: {
        create: {
          userId
        }
      }
    },
    include: {
      sender: { select: { id: true, name: true, role: true, avatarUrl: true } }
    }
  });

  const mappedUserMessage = mapChatMessage(userMessage);
  publishConsultationEvent(consultationId, 'NEW_MESSAGE', mappedUserMessage);
  publishConsultationEvent(consultationId, 'TYPING', { isTyping: true, sender: AI_BOT_NAME });

  let typingStopped = false;

  try {
    const recentMessages = await prisma.chatMessage.findMany({
      where: { consultationId },
      take: 15,
      orderBy: { timestamp: 'desc' }
    });

    const chatHistory = recentMessages.reverse().map((chatMessage) => ({
      role: chatMessage.senderId === aiBotUserId ? 'assistant' : 'user',
      content: chatMessage.message
    }));

    const response = await ollama.chat({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(consultation.scan) },
        ...chatHistory
      ]
    });

    const aiReplyContent = response?.message?.content?.trim();

    if (!aiReplyContent) {
      throw new Error('Gemma AI did not return a response');
    }

    const aiMessage = await prisma.chatMessage.create({
      data: {
        consultationId,
        senderId: aiBotUserId,
        message: aiReplyContent,
        timestamp: new Date()
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } }
      }
    });

    await prisma.consultation.update({
      where: { id: consultationId },
      data: { updatedAt: new Date() }
    });

    const mappedAiMessage = mapChatMessage(aiMessage);
    publishConsultationEvent(consultationId, 'TYPING', { isTyping: false, sender: AI_BOT_NAME });
    typingStopped = true;
    publishConsultationEvent(consultationId, 'NEW_MESSAGE', mappedAiMessage);

    return mappedAiMessage;
  } finally {
    if (!typingStopped) {
      publishConsultationEvent(consultationId, 'TYPING', { isTyping: false, sender: AI_BOT_NAME });
    }
  }
};

module.exports = {
  getAiChatHistory,
  sendAiMessage
};
