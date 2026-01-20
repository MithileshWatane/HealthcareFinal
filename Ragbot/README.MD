
# Medical RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot for medical diagnosis assistance using **Groq** (blazing-fast LLM API with generous free tier!).

# How to run?
### STEPS:

Clone the repository

```bash
git clone https://github.com/09viv/MediBot.git
```
### STEP 01- Create a conda environment after opening the repository

```bash
conda create -n medibot python=3.10 -y
```

```bash
conda activate medibot
```
## Create python virtual environment 
```bash
python -m venv venv
```
## Activate environment
```bash
venv\Scripts\activate
```
### STEP 02- install the requirements
```bash
pip install -r requirements.txt
```

### STEP 03- Get Your Free Groq API Key

1. Visit: **https://console.groq.com/keys**
2. Sign up (free, no credit card required)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

### STEP 04- Create a `.env` file in the root directory and add your API keys:

```ini
GROQ_API_KEY = "gsk_your_groq_api_key_here"
PINECONE_API_KEY = "your_pinecone_api_key_here"
```

**Get your API keys:**
- Groq API Key: https://console.groq.com/keys (Free!)
- Pinecone API Key: https://app.pinecone.io/


```bash
# run the following command to store embeddings to pinecone
python store_index.py
```

```bash
# Finally run the following command
python app.py
```

Now,
```bash
open up localhost:5000
```


### Techstack Used:

- Python
- LangChain
- Flask
- **Groq (Mixtral-8x7b)** - Lightning-fast LLM API!
- Pinecone

### Why Groq?

✅ **10x Faster** than other LLM APIs  
✅ **14,400 requests/day** on free tier  
✅ **No credit card** required  
✅ **Stable & Reliable**  



# AWS-CICD-Deployment-with-Github-Actions

## 1. Login to AWS console.

## 2. Create IAM user for deployment

	#with specific access

	1. EC2 access : It is virtual machine

	2. ECR: Elastic Container registry to save your docker image in aws


	#Description: About the deployment

	1. Build docker image of the source code

	2. Push your docker image to ECR

	3. Launch Your EC2 

	4. Pull Your image from ECR in EC2

	5. Lauch your docker image in EC2

	#Policy:

	1. AmazonEC2ContainerRegistryFullAccess

	2. AmazonEC2FullAccess

	
## 3. Create ECR repo to store/save docker image
    - Save the URI: 315865595366.dkr.ecr.us-east-1.amazonaws.com/medicalbot

	
## 4. Create EC2 machine (Ubuntu) 

## 5. Open EC2 and Install docker in EC2 Machine:
	
	
	#optinal

	sudo apt-get update -y

	sudo apt-get upgrade
	
	#required

	curl -fsSL https://get.docker.com -o get-docker.sh

	sudo sh get-docker.sh

	sudo usermod -aG docker ubuntu

	newgrp docker
	
# 6. Configure EC2 as self-hosted runner:
    setting>actions>runner>new self hosted runner> choose os> then run command one by one


# 7. Setup github secrets:

   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_DEFAULT_REGION
   - ECR_REPO
   - PINECONE_API_KEY
   - OPENAI_API_KEY
