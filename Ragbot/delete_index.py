"""
Script to delete the old Pinecone index and recreate it with new embeddings
"""

from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

def delete_index():
    pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
    index_name = "medical-chatbot"
    
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if index_name in existing_indexes:
        print(f"Deleting existing index: {index_name}")
        pc.delete_index(index_name)
        print(f"Index {index_name} deleted successfully")
    else:
        print(f"Index {index_name} does not exist")

if __name__ == "__main__":
    delete_index()
