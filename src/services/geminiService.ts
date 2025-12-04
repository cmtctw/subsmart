import { GoogleGenAI, Type } from "@google/genai";
import { BillingCycle, Category, Subscription } from "../types";

// 在 Vite 中，使用 import.meta.env.VITE_API_KEY 讀取環境變數
// 請確保根目錄下的 .env 檔案中有設定 VITE_API_KEY=您的金鑰
const apiKey = import.meta.env.VITE_API_KEY;

// 如果沒有 Key，給予一個警告或處理
if (!apiKey) {
  console.warn("Missing VITE_API_KEY in .env file");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY_FOR_BUILD" });

export const parseSubscriptionInput = async (input: string): Promise<Partial<Subscription>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract subscription details from this text: "${input}". 
      Infer the category based on the service name. 
      If no currency is specified, assume TWD if text is Chinese, or USD if English. 
      If no date is specified, use today's date.
      Return the data in a strict JSON structure matching the provided Chinese enum values.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the service (e.g., Netflix, Adobe)" },
            price: { type: Type.NUMBER, description: "Cost of the subscription" },
            currency: { type: Type.STRING, description: "Currency code (e.g., USD, TWD)" },
            billingCycle: { 
              type: Type.STRING, 
              enum: [BillingCycle.MONTHLY, BillingCycle.YEARLY, BillingCycle.WEEKLY],
              description: "Billing frequency"
            },
            firstBillDate: { type: Type.STRING, description: "ISO 8601 Date string (YYYY-MM-DD)" },
            category: { 
              type: Type.STRING, 
              enum: [Category.ENTERTAINMENT, Category.SOFTWARE, Category.UTILITIES, Category.INSURANCE, Category.OTHER],
              description: "Category of the service"
            },
            description: { type: Type.STRING, description: "Short description" },
            websiteUrl: { type: Type.STRING, description: "URL of the service if detectable" }
          },
          required: ["name", "price", "billingCycle", "category"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<Subscription>;
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Error parsing subscription with Gemini:", error);
    throw error;
  }
};

export const getSpendingInsights = async (subscriptions: Subscription[]): Promise<string> => {
    try {
        if (!apiKey) return "請先設定 API Key 以啟用 AI 分析功能。";

        const subsSummary = subscriptions.map(s => `${s.name}: ${s.currency} ${s.price} / ${s.billingCycle}`).join(', ');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Here is a list of my subscriptions: ${subsSummary}. 
            Provide a very brief (max 2 sentences) financial tip or observation about my spending habits. 
            Be encouraging but realistic.
            Please answer in Traditional Chinese (繁體中文).`,
        });
        return response.text || "請持續追蹤您的開支！";
    } catch (e) {
        console.error("Error getting insights", e);
        return "定期檢視您的訂閱項目可以幫助省錢。";
    }
}