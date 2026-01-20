"""
Script to process the medical PDF and store embeddings in Pinecone
Run this script once to populate the vector database
"""

from src.helper import (
    load_pdf,
    text_split,
    download_gemini_embeddings,
    store_embeddings_pinecone
)
import os

def main():
    print("Starting PDF processing and embedding generation...")
    
    # Path to the medical book PDF
    pdf_path = "data/Medical_book.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return
    
    # Step 1: Load PDF
    print(f"Loading PDF from {pdf_path}...")
    extracted_data = load_pdf(pdf_path)
    print(f"Loaded {len(extracted_data)} pages from PDF")
    
    # Step 2: Split text into chunks
    print("Splitting text into chunks...")
    text_chunks = text_split(extracted_data)
    print(f"Created {len(text_chunks)} text chunks")
    
    # Step 3: Initialize embeddings
    print("Initializing Gemini embeddings...")
    embeddings = download_gemini_embeddings()
    
    # Step 4: Store embeddings in Pinecone
    print("Storing embeddings in Pinecone (this may take a few minutes)...")
    vectorstore = store_embeddings_pinecone(
        text_chunks=text_chunks,
        embeddings=embeddings,
        index_name="medical-chatbot"
    )
    
    print("✓ Successfully processed PDF and stored embeddings in Pinecone!")
    print("You can now run the Flask app with: python app.py")

if __name__ == "__main__":
    main()
