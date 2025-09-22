import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Definisikan struktur yang kita harapkan dari output JSON AI
interface AnalyzedItem {
  itemName: string;
  description: string;
  brandModel: string;
  category: string;
  unitPrice: number;
}

// Lakukan pengecekan environment variable di awal untuk 'fail-fast'
if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable is not set.');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Helper function to extract JSON from raw AI output
    const extractJson = <T>(rawOutput: unknown, modelName: string): T => {
      const outputString = Array.isArray(rawOutput) ? rawOutput.join('') : String(rawOutput);
      
      const startIndex = outputString.indexOf('{');
      const endIndex = outputString.lastIndexOf('}');

      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error(`[${modelName}] Raw AI Output:`, outputString);
        throw new Error(
          `[${modelName}] Failed to find a valid JSON block in the AI response.`
        );
      }

      const jsonString = outputString.substring(startIndex, endIndex + 1);

      try {
        return JSON.parse(jsonString) as T;
      } catch (parseError) {
        console.error(`[${modelName}] Failed to parse JSON from AI response:`, jsonString);
        console.error(`[${modelName}] Parse Error:`, parseError);
        throw new Error(`[${modelName}] AI returned a malformed JSON structure.`);
      }
    };

    // --- Step 1: Vision Analysis (in English) ---
    const visionPrompt = `
    Analyze the image of the item and provide details in JSON format.
    The JSON object must contain these exact keys: "itemName", "description", "brandModel", "category", "unitPrice".

    - itemName: A concise name for the item, in English.
    - description: A detailed and comprehensive description of the item in English, including its condition, main features, visible specifications, and any notable characteristics. Aim for at least 3-5 sentences.
    - brandModel: The specific brand and model/type of the item. If unknown or not clearly visible, state "Unknown".
    - category: Choose the single most suitable category for the item from the following predefined list. If multiple fit, choose the most specific one. If none fit perfectly, select "Other Assets".
        List of categories: "Fixed Assets", "Property, Plant, and Equipment", "Land & Buildings", "Production Machinery & Equipment", "Vehicles", "Office Furniture & Fixtures",
        "IT Assets", "Hardware", "Software", "Communication Devices",
        "Merchandise Inventory", "Finished Goods", "Work-in-Progress", "Raw Materials",
        "Operational Supplies & Consumables", "Office Supplies", "Stationery", "Pantry Supplies", "Janitorial Supplies", "Maintenance, Repair, and Operations (MRO) Supplies", "Spare Parts", "Safety Equipment", "Work Tools",
        "Intangible Assets", "Intellectual Property", "Licenses & Franchises", "Goodwill",
        "Other Assets", "Marketing & Promotional Materials", "Important Documents & Archives", "Sample Goods".
    - unitPrice: Estimate the approximate current market price of the item in Indonesian Rupiah (IDR). Provide only the numeric value (e.g., 2500000) without any currency symbols, separators (like commas or dots), or additional text. If a precise estimate is difficult, provide a reasonable approximation. If the price cannot be estimated at all, provide 0.

    Here is the item:
    `;

    console.log('Running Vision Model (ibm-granite/granite-vision-3.3-2b)...');
    const visionOutput = await replicate.run(
      'ibm-granite/granite-vision-3.3-2b',
      {
        input: {
          images: [imageUrl],
          prompt: visionPrompt,
          max_tokens: 1024,
          temperature: 0.2,
        },
      }
    );

    const visionData = extractJson<AnalyzedItem>(visionOutput, 'VisionModel');

    // --- Step 2: Translation (to Indonesian) ---
    const translationPrompt = `
    Translate the 'itemName' and 'description' values from the following JSON object into natural and accurate Bahasa Indonesia.
    Return a new JSON object with the translated text in "translatedName" and "translatedDescription" keys.

    Input:
    ${JSON.stringify({
      itemName: visionData.itemName,
      description: visionData.description,
    })}

    Output:
    `;

    console.log('Running Language Model for Translation (ibm-granite/granite-3.3-8b-instruct)...');
    const translationOutput = await replicate.run(
      'ibm-granite/granite-3.3-8b-instruct',
      {
        input: {
          prompt: translationPrompt,
          max_tokens: 1024,
          temperature: 0.3,
        },
      }
    );

    interface TranslationResult {
      translatedName: string;
      translatedDescription: string;
    }

    const translatedData = extractJson<TranslationResult>(translationOutput, 'TranslationModel');

    // --- Step 3: Combine Results ---
    const finalData: AnalyzedItem = {
      ...visionData,
      itemName: translatedData.translatedName,
      description: translatedData.translatedDescription,
    };

    return NextResponse.json(finalData);

  } catch (error) {
    console.error('Error in /api/analyze-image:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: 'Failed to analyze image.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}