# Ollama Setup Instructions for Free AI Medical Recommendations

## 🚀 Quick Setup (Windows)

### 1. Download and Install Ollama
```bash
# Download from: https://ollama.com/download/windows
# Run the installer and follow the setup wizard
```

### 2. Install Medical AI Model (Run in Command Prompt/PowerShell)
```bash
# Install the medical-specific model (recommended)
ollama pull meditron:7b

# Alternative models (if you have limited RAM/storage):
ollama pull llama3.2:3b    # General purpose, works for medical tasks
ollama pull phi3:3.8b      # Efficient and capable
```

### 3. Verify Installation
```bash
# Check if Ollama is running and models are installed
ollama list

# Test the model with REST API (what your app uses)
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2:3b",
  "messages": [{"role": "user", "content": "Hello, test message"}],
  "stream": false
}'
```

## 🔧 Configuration

Your `.env` file is already configured for Ollama:
```
VITE_AI_BACKEND=ollama
VITE_OLLAMA_MODEL=meditron:7b
```

## 🏥 Model Recommendations

| Model | Size | RAM Required | Best For | Download Command |
|-------|------|--------------|----------|------------------|
| **meditron:7b** | 3.8GB | 8GB+ | Medical diagnosis | `ollama pull meditron:7b` |
| **meditron:70b** | 39GB | 32GB+ | Advanced medical | `ollama pull meditron:70b` |
| **llama3.2:3b** | 2GB | 4GB+ | General medical | `ollama pull llama3.2:3b` |
| **mistral:7b** | 4.1GB | 8GB+ | Medical reasoning | `ollama pull mistral:7b` |

## 🐛 Troubleshooting

### If Ollama won't start:
```bash
# Kill any existing Ollama processes
taskkill /F /IM ollama.exe

# Start Ollama manually
ollama serve
```

### If model download fails:
```bash
# Try again (downloads can be interrupted)
ollama pull meditron:7b

# Or try a smaller model
ollama pull llama3.2:3b
```

### If you get connection errors in the app:
1. Make sure Ollama is running: `ollama list`
2. Check if the model is installed: `ollama list`
3. Restart your development server: `npm run start`

## 💡 Pro Tips

- **Start with meditron:7b** - Best balance of medical knowledge and performance
- **Monitor RAM usage** - Larger models need more memory
- **Keep Ollama updated** - New versions may improve performance
- **Use fallback** - Set `VITE_USE_MOCK_AI=true` for testing when Ollama is unavailable

## 🔄 Switching Between AI Backends

To switch to OpenAI (paid):
```env
VITE_AI_BACKEND=openai
VITE_OPENAI_API_KEY=your_api_key_here
```

To switch back to Ollama (free):
```env
VITE_AI_BACKEND=ollama
VITE_OLLAMA_MODEL=meditron:7b
```

**Ready to test?** Run `ollama pull meditron:7b` and restart your app! 🎉