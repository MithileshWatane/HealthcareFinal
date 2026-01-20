# Quick Start Guide - Hugging Face Migration

## ✅ Migration Complete!

Your RAG chatbot now uses **Hugging Face** instead of Gemini.

## 🚀 Quick Setup (3 Steps)

### 1. Get Your Hugging Face Token
Visit: https://huggingface.co/settings/tokens
- Click "New token"
- Name it (e.g., "Medical Chatbot")
- Select "Read" access
- Copy the token

### 2. Update `.env` File
Open `d:\Health\Ragbot\.env` and add your token:
```
HUGGINGFACE_API_TOKEN=hf_YourActualTokenHere
PINECONE_API_KEY=pcsk_3REYo5_Mve6xgmNrUptMKQ6jn9NzpycDqUEAt765D2juUQMJ4orzBUJecFmKLb4zfysU4r
```

### 3. Install & Run
```bash
pip install -r requirements.txt
python app.py
```

Visit: http://localhost:5000

## 🎯 What Changed?

| Component | Before | After |
|-----------|--------|-------|
| **LLM** | Gemini 1.5 Flash | Mistral-7B-Instruct-v0.2 |
| **Embeddings** | HuggingFace (unchanged) | HuggingFace (unchanged) |
| **API Key** | GOOGLE_API_KEY | HUGGINGFACE_API_TOKEN |

## 📝 Files Modified

- ✅ `app.py` - Switched to HuggingFaceEndpoint
- ✅ `src/helper.py` - Removed Gemini imports
- ✅ `.env` - Updated API token
- ✅ `requirements.txt` - Removed Gemini packages
- ✅ `README.MD` - Updated documentation

## 💡 Benefits

- ✅ No API quota limits (generous free tier)
- ✅ Open source models
- ✅ Free for moderate usage
- ✅ Easy to switch models

## 🔧 Troubleshooting

**Authentication Error?**
- Check your token in `.env`
- Verify token has "Read" access

**Slow Responses?**
- Normal for free tier
- Consider upgrading to HF Pro
- Or switch to smaller model (see below)

## 🔄 Switch Models (Optional)

Edit `app.py` line 22 to change models:

```python
# Faster, lighter model
repo_id="google/flan-t5-large"

# Current model (balanced)
repo_id="mistralai/Mistral-7B-Instruct-v0.2"

# More powerful (requires approval)
repo_id="meta-llama/Llama-2-7b-chat-hf"
```

## 📚 Need Help?

See the full walkthrough in the artifacts folder for detailed information.
