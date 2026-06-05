const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getAiModelConfig = () => {
  const baseUrl = process.env.AI_BASE_URL ? trimTrailingSlash(process.env.AI_BASE_URL.trim()) : '';
  const predictUrl = process.env.AI_PREDICT_URL?.trim() || (baseUrl ? `${baseUrl}/predict` : '');
  const gradcamUrl = process.env.AI_GRADCAM_URL?.trim() || (baseUrl ? `${baseUrl}/viz` : '');
  const accessToken = process.env.AI_ACCESS_TOKEN?.trim() || '';

  if (!predictUrl) {
    throw new Error('AI_PREDICT_URL or AI_BASE_URL is not defined in environment variables');
  }

  return {
    baseUrl,
    predictUrl,
    gradcamUrl,
    accessToken,
  };
};

const buildAiRequestHeaders = (formHeaders = {}) => {
  const { accessToken } = getAiModelConfig();

  return {
    ...formHeaders,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
};

module.exports = {
  buildAiRequestHeaders,
  getAiModelConfig,
};
