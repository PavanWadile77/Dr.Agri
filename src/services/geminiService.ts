import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MarketRateData {
  cropName: string;
  price: string;
  unit: string;
  normalizedPrice: string;
  normalizedUnit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: string;
  marketName: string;
  sentiment: string;
  imageKeyword: string;
}

const getLanguageInstruction = (lang: string) => {
  switch (lang) {
    case 'hi': return "Please provide the response in Hindi.";
    case 'mr': return "Please provide the response in Marathi.";
    default: return "Please provide the response in English.";
  }
};

export interface CropDiagnosisData {
  productName: string;
  condition: string;
  qualityScore: number; // 0-100
  issues: {
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  assessment: string;
  immediateActions: string[];
  maintenanceTips: string[];
}

export const diagnoseCrop = async (imageData: string, cropType: string, lang: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are an expert agricultural consultant and quality inspector. 
  Analyze this image of an agricultural product (specifically ${cropType}). 
  1. Identify the product and its current condition.
  2. Check for any visible diseases, pests, damage, or quality issues.
  3. Provide a detailed assessment of its health or quality.
  4. Suggest immediate actions or treatments if issues are found.
  5. Give tips for maintaining quality or preventing future problems.
  
  Provide the response in JSON format. ${getLanguageInstruction(lang)}`;

  let mimeType = "image/jpeg";
  let base64Data = imageData;
  
  if (imageData.startsWith("data:")) {
    const commaIndex = imageData.indexOf(",");
    if (commaIndex !== -1) {
      const header = imageData.substring(0, commaIndex);
      base64Data = imageData.substring(commaIndex + 1);
      const match = header.match(/data:([^;]+)/);
      if (match && match[1] && match[1].startsWith("image/")) {
        mimeType = match[1];
      }
    }
  }

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          condition: { type: Type.STRING },
          qualityScore: { type: Type.NUMBER },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                description: { type: Type.STRING },
              },
              required: ['name', 'severity', 'description'],
            },
          },
          assessment: { type: Type.STRING },
          immediateActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          maintenanceTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['productName', 'condition', 'qualityScore', 'issues', 'assessment', 'immediateActions', 'maintenanceTips'],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as CropDiagnosisData;
  } catch (e) {
    console.error("Failed to parse crop diagnosis JSON:", e);
    return null;
  }
};

export const getMarketRates = async (cropName: string, location: { country?: string, state?: string, district?: string, taluka?: string }, lang: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const locationStr = [location.taluka, location.district, location.state, location.country].filter(Boolean).join(", ");
  const prompt = `Find the latest market rates and price trends for ${cropName} in ${locationStr || 'agricultural markets'}. 
  Provide a "Trending App" style analysis in JSON format.
  Include:
  1. Current average price in Indian Rupees (INR) per the standard unit for this crop (e.g., KG, Quintal, Dozen, Piece).
  2. A normalized price in Indian Rupees (INR) per a smaller unit (e.g., if main price is per Dozen, provide price per 1 Piece; if per Quintal, provide price per 1 KG).
  3. The name of the smaller unit used for the normalized price (e.g., "KG", "Piece").
  4. Trend (up, down, or stable) and percentage change.
  5. The specific market or hub name.
  6. Market sentiment (Bullish/Bearish).
  7. A simple image keyword for this crop (e.g., "wheat field", "red tomatoes").
  
  ${getLanguageInstruction(lang)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            price: { type: Type.STRING },
            unit: { type: Type.STRING },
            normalizedPrice: { type: Type.STRING },
            normalizedUnit: { type: Type.STRING },
            trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
            trendPercentage: { type: Type.STRING },
            marketName: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            imageKeyword: { type: Type.STRING },
          },
          required: ['cropName', 'price', 'unit', 'normalizedPrice', 'normalizedUnit', 'trend', 'trendPercentage', 'marketName', 'sentiment', 'imageKeyword'],
        },
      },
      systemInstruction: "You are a high-energy market analyst for a trending agricultural app. Provide accurate, real-time, and visually engaging market information in JSON format. Use the provided schema.",
    },
  });

  try {
    return JSON.parse(response.text || "[]") as MarketRateData[];
  } catch (e) {
    console.error("Failed to parse market rates JSON:", e);
    return [];
  }
};
