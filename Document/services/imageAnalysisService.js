import Groq from "groq-sdk";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Convert image to base64
function imageToBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
}

// Specialized prompts for each medical imaging type
const prompts = {
  xray: `You are an expert radiologist analyzing an X-ray image. Provide a detailed medical analysis including:
1. Overall impression and image quality
2. Normal findings (if any)
3. Abnormal findings or areas of concern (if any)
4. Specific anatomical observations
5. Recommendations for follow-up or further testing
6. Confidence level in your assessment

Include a disclaimer that this is AI-assisted analysis and must be reviewed by a qualified healthcare professional.`,

  mri: `You are an expert radiologist analyzing an MRI scan. Provide a comprehensive medical analysis including:
1. Image quality and sequences visible
2. Normal anatomical structures observed
3. Any abnormalities or lesions
4. Signal characteristics
5. Differential diagnosis
6. Recommendations for further evaluation

Note that this analysis must be confirmed by a board-certified radiologist.`,

  ct: `You are an expert radiologist analyzing a CT scan. Provide a detailed medical analysis including:
1. Image quality and contrast
2. Normal findings
3. Abnormalities or masses
4. Measurements if relevant
5. Surrounding structures
6. Clinical recommendations

Final diagnosis requires clinical correlation.`,

  labReport: `You are a clinical pathologist analyzing a laboratory report. Provide:
1. Summary of results
2. Abnormal values
3. Clinical significance
4. Possible conditions
5. Recommendations for further testing

Interpretation must consider patient history.`,

  skin: `You are a dermatologist analyzing a skin image. Provide:
1. Lesion description
2. Morphology (color, size, borders)
3. Differential diagnosis
4. Severity assessment
5. Treatment recommendations
6. Red flags requiring urgent care

In-person examination is required for confirmation.`
};

// Main analysis function
export async function analyzeImage(imagePath, analysisType) {
  try {
    const base64Image = imageToBase64(imagePath);
    const systemPrompt = prompts[analysisType];

    if (!systemPrompt) {
      throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 0.9
    });

    return {
      success: true,
      analysis: completion.choices[0]?.message?.content ?? "No analysis generated",
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      analysisType,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

// Optional helper to parse output
export function parseAnalysisResponse(analysisText) {
  const sections = analysisText.split("\n\n").filter(Boolean);
  return {
    fullAnalysis: analysisText,
    sections,
    summary: sections[0] ?? analysisText.slice(0, 200) + "..."
  };
}
