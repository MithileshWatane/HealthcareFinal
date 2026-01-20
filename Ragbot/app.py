from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from src.helper import download_gemini_embeddings, load_vectorstore
from src.prompt import prompt_template
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize embeddings and vector store
embeddings = download_gemini_embeddings()
vectorstore = load_vectorstore(embeddings, index_name="medical-chatbot")

# Initialize Groq LLM (Fast, Stable, Generous Free Tier!)
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.environ.get("GROQ_API_KEY"),
    temperature=0.3,
    max_tokens=512
)

# Create prompt template
PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# Create retrieval chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT}
)

@app.route('/')
def index():
    """Serve the main chat interface"""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """
    Handle chat requests
    Expects JSON: {"message": "user question"}
    Returns JSON: {"response": "bot answer"}
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        print(f"Received question: {user_message}")
        
        # Get response from RAG chain
        # Try new API first, fall back to old API if needed
        try:
            result = qa_chain.invoke({"query": user_message})
        except Exception as invoke_error:
            print(f"invoke() failed, trying __call__(): {invoke_error}")
            result = qa_chain({"query": user_message})
        
        bot_response = result["result"]
        print(f"Generated response: {bot_response[:100]}...")
        
        return jsonify({
            "response": bot_response,
            "success": True
        })
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing request: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        
        # Check if it's a quota error
        error_message = str(e)
        if "429" in error_message or "quota" in error_message.lower():
            return jsonify({
                "error": "API quota exceeded. You've reached the daily limit for the Gemini embedding API. Please wait 24 hours or upgrade your API plan.",
                "success": False,
                "error_type": "quota_exceeded"
            }), 429
        
        return jsonify({
            "error": f"An error occurred: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    print("Starting Medical Chatbot...")
    print("Make sure you have run 'python store_index.py' first to generate embeddings")
    app.run(debug=True, host='0.0.0.0', port=5000)
