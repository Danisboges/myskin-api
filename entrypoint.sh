#!/bin/sh

# 1. Start the Ollama engine background service
echo "🚀 Initializing Ollama daemon..."
ollama serve &

# 2. Wait a few seconds for the engine to initialize completely
sleep 5

# 3. Download the target LLM if it isn't already found on the persistent mount
if ollama list | grep -q "gemma2"; then
  echo "✅ Gemma2 model found on volume. Ready to serve."
else
  echo "📥 Gemma2 model not detected. Downloading model files (this will take a while on initial boot)..."
  ollama pull gemma2
fi

# 4. Start your Node.js production service
echo "🟢 Booting backend rest api..."
# Adjust this file path matching your package.json execution command (e.g., node server.js or node index.js)
node server.js