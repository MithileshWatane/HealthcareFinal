# Groq Setup Guide

## What is Groq?

Groq is a lightning-fast LLM inference API that provides access to powerful models like Mixtral, Llama, and Gemma with **extremely fast response times** and a **generous free tier**.

## Why Groq?

✅ **Blazing Fast** - Up to 10x faster than other APIs  
✅ **Generous Free Tier** - 14,400 requests/day on free tier  
✅ **No Credit Card Required** - Free tier doesn't need payment info  
✅ **Stable API** - Well-maintained, reliable service  
✅ **Multiple Models** - Mixtral, Llama 3, Gemma, and more  
✅ **Simple Integration** - Works seamlessly with LangChain  

---

## Quick Setup (3 Steps)

### 1. Get Your Free Groq API Key

1. Visit: **https://console.groq.com/keys**
2. Sign up with Google/GitHub (free, no credit card)
3. Click **"Create API Key"**
4. Give it a name (e.g., "Medical Chatbot")
5. Copy the key (starts with `gsk_...`)

### 2. Add to `.env` File

Open `d:\Health\Ragbot\.env` and add:

```ini
GROQ_API_KEY=gsk_your_actual_key_here
PINECONE_API_KEY=pcsk_3REYo5...
```

### 3. Install Dependencies & Run

```bash
pip install -r requirements.txt
python app.py
```

Visit: **http://localhost:5000**

---

## Current Configuration

Your chatbot uses:
- **Model**: Mixtral-8x7b-32768 (47B parameters, 32k context)
- **Temperature**: 0.3 (balanced creativity)
- **Max Tokens**: 512 (response length)

```python
llm = ChatGroq(
    model="mixtral-8x7b-32768",
    groq_api_key=os.environ.get("GROQ_API_KEY"),
    temperature=0.3,
    max_tokens=512
)
```

---

## Available Models

You can easily switch models in `app.py`:

### Recommended for Medical Use

```python
# Current - Mixtral (Best balance)
model="mixtral-8x7b-32768"

# Llama 3 70B (Most powerful, slower)
model="llama3-70b-8192"

# Llama 3 8B (Faster, lighter)
model="llama3-8b-8192"

# Gemma 7B (Good for specific tasks)
model="gemma-7b-it"
```

### Model Comparison

| Model | Parameters | Context | Speed | Quality |
|-------|-----------|---------|-------|---------|
| **mixtral-8x7b-32768** | 47B | 32k | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| llama3-70b-8192 | 70B | 8k | ⚡⚡ | ⭐⭐⭐⭐⭐ |
| llama3-8b-8192 | 8B | 8k | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| gemma-7b-it | 7B | 8k | ⚡⚡⚡⚡ | ⭐⭐⭐ |

---

## Free Tier Limits

**Groq Free Tier**:
- 14,400 requests per day
- 30 requests per minute
- No credit card required
- No expiration

This is **more than enough** for development and moderate production use!

---

## Groq vs Other Solutions

| Feature | Groq ✅ | Ollama | HuggingFace | Gemini |
|---------|---------|--------|-------------|--------|
| **Speed** | ⚡⚡⚡⚡⚡ | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| **Setup** | Easy | Medium | Easy | Easy |
| **Free Tier** | 14.4k/day | Unlimited | Limited | Limited |
| **API Key** | Required | None | Required | Required |
| **Internet** | Required | Optional | Required | Required |
| **Installation** | None | ~4GB download | None | None |
| **Hardware** | None | 8GB+ RAM | None | None |

---

## Troubleshooting

### Authentication Error
**Problem**: Invalid API key  
**Solution**: 
- Check your key in `.env` starts with `gsk_`
- Make sure there are no extra spaces
- Regenerate key at https://console.groq.com/keys

### Rate Limit Error
**Problem**: Too many requests  
**Solution**:
- Free tier: 30 requests/minute
- Wait a minute or upgrade to paid tier

### Model Not Found
**Problem**: Invalid model name  
**Solution**: Use one of the supported models listed above

---

## Switching Models

To use a different model:

1. **Update `app.py`**:
   ```python
   llm = ChatGroq(
       model="llama3-8b-8192",  # Change this
       groq_api_key=os.environ.get("GROQ_API_KEY"),
       temperature=0.3,
       max_tokens=512
   )
   ```

2. **Restart the app**:
   ```bash
   python app.py
   ```

---

## Example Usage

Once running, you can ask medical questions like:

- "What are the symptoms of diabetes?"
- "Explain how insulin works"
- "What is the difference between Type 1 and Type 2 diabetes?"

The chatbot will use RAG to retrieve relevant information from your medical documents and generate accurate responses using Groq's fast inference.

---

## Next Steps

1. ✅ Get API key from https://console.groq.com/keys
2. ✅ Add to `.env` file
3. ✅ Run `pip install -r requirements.txt`
4. ✅ Run `python app.py`
5. ✅ Test at http://localhost:5000

Enjoy blazing-fast medical Q&A! 🚀
