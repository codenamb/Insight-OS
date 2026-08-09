interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BusinessContext {
  summary: string;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  totalUnitsSold: number;
  outOfStockCount: number;
  lowStockCount: number;
  problems: any[];
  opportunities: any[];
  trends: any[];
  categoryBreakdown: any[];
  topProducts: any[];
  storePerformance: any[];
  monthlyData: any[];
}

// ----------------------------------------------------------------------
// 1. Local Ollama IBM Granite Client (http://localhost:11434)
// ----------------------------------------------------------------------
async function callOllamaGranite(question: string, context: BusinessContext, _history: AIMessage[]): Promise<string> {
  const prompt = 
    `You are InsightOS AI, an executive retail business intelligence assistant powered by IBM Granite LLM.\n` +
    `Below is the live operational dataset for an Indian Multi-Store Retail Network (all revenues in INR ₹):\n\n` +
    `[BUSINESS CONTEXT DATASET]\n` +
    `Summary: ${context.summary}\n` +
    `Total Chain Revenue: ₹${context.totalRevenue.toLocaleString('en-IN')} (${context.profitMargin.toFixed(1)}% Net Margin)\n` +
    `Net Profit: ₹${context.totalProfit.toLocaleString('en-IN')}\n` +
    `Total Volume Sold: ${context.totalUnitsSold.toLocaleString('en-IN')} units\n` +
    `Out of Stock Items: ${context.outOfStockCount}\n` +
    `Low Stock Warnings: ${context.lowStockCount}\n\n` +
    `[STORE PERFORMANCE METRICS]\n` +
    JSON.stringify(context.storePerformance.map(s => ({
      name: s.storeName,
      revenue_inr: s.totalRevenue,
      margin_pct: s.profitMargin.toFixed(1),
      growth_pct: (s.growthRate * 100).toFixed(1),
      status: s.riskStatus,
      topCategory: s.topCategory
    })), null, 2) + `\n\n` +
    `User Executive Query: "${question}"\n\n` +
    `InsightOS Granite AI Response:`;

  // Detect model from Ollama tags endpoint
  let modelToUse = 'granite3-dense:8b';
  try {
    const tagsRes = await fetch('/ollama/api/tags');
    if (tagsRes.ok) {
      const tagsData = await tagsRes.json();
      const models: any[] = tagsData.models || [];
      if (models.length > 0) {
        const granite = models.find((m) => m.name.toLowerCase().includes('granite'));
        modelToUse = granite ? granite.name : models[0].name;
      }
    }
  } catch (e) {
    //
  }

  const response = await fetch('/ollama/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelToUse,
      prompt: prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error (${response.status})`);
  }

  const data = await response.json();
  if (!data.response || !data.response.trim()) {
    throw new Error('Ollama returned empty response string');
  }

  return data.response.trim();
}

// ----------------------------------------------------------------------
// 2. Live IBM watsonx.ai Cloud API Client
// ----------------------------------------------------------------------
let cachedIAMToken: string | null = null;
let tokenExpiryTime: number = 0;

async function getIBMIAMToken(apiKey: string): Promise<string> {
  const now = Date.now();
  if (cachedIAMToken && now < tokenExpiryTime - 60000) {
    return cachedIAMToken;
  }

  const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
  });

  if (!response.ok) {
    throw new Error(`IBM IAM Token exchange failed with status ${response.status}`);
  }

  const data = await response.json();
  cachedIAMToken = data.access_token;
  tokenExpiryTime = now + (data.expires_in || 3600) * 1000;
  return cachedIAMToken!;
}

async function callLiveIBMGraniteAPI(
  question: string,
  context: BusinessContext,
  apiKey: string,
  projectId: string,
  region: string = 'us-south'
): Promise<string> {
  const token = await getIBMIAMToken(apiKey);
  const endpoint = `https://${region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`;

  const systemPrompt = 
    `You are InsightOS AI, an executive retail business intelligence assistant powered by IBM Granite LLM.\n` +
    `Below is the live operational dataset for an Indian Multi-Store Retail Network (all revenues in INR ₹):\n\n` +
    `Summary: ${context.summary}\n` +
    `Total Chain Revenue: ₹${context.totalRevenue.toLocaleString('en-IN')} (${context.profitMargin.toFixed(1)}% Net Margin)\n` +
    `Net Profit: ₹${context.totalProfit.toLocaleString('en-IN')}\n\n` +
    `User Executive Query: "${question}"\n\n` +
    `InsightOS Granite AI Response:`;

  const payload = {
    input: systemPrompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 600,
      min_new_tokens: 1,
      repetition_penalty: 1.1,
    },
    model_id: 'ibm/granite-13b-chat-v2',
    project_id: projectId,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`IBM watsonx Granite API call failed (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const generatedText = result.results?.[0]?.generated_text;

  if (!generatedText) {
    throw new Error('IBM Granite API returned an empty text generation result.');
  }

  return generatedText.trim();
}

// ----------------------------------------------------------------------
// Main Entrypoint: 100% Real Generative AI Execution
// ----------------------------------------------------------------------
export async function generateAIResponse(
  question: string,
  context: BusinessContext,
  conversationHistory: AIMessage[]
): Promise<string> {
  // Try 1: Call Local Ollama IBM Granite (http://localhost:11434)
  try {
    const ollamaResponse = await callOllamaGranite(question, context, conversationHistory);
    if (ollamaResponse) {
      return ollamaResponse;
    }
  } catch (err: any) {
    console.log('Ollama local AI call failed:', err);
  }

  // Try 2: Call IBM watsonx.ai Cloud API key if set in .env
  const ibmApiKey = import.meta.env.VITE_IBM_GRANITE_API_KEY;
  const ibmProjectId = import.meta.env.VITE_IBM_PROJECT_ID;
  const ibmRegion = import.meta.env.VITE_IBM_REGION || 'us-south';

  if (ibmApiKey && ibmApiKey !== 'your_ibm_cloud_api_key_here') {
    try {
      const cloudResponse = await callLiveIBMGraniteAPI(question, context, ibmApiKey, ibmProjectId || ibmApiKey, ibmRegion);
      if (cloudResponse) return cloudResponse;
    } catch (err: any) {
      console.warn('IBM Cloud API call failed:', err);
    }
  }

  // If neither Ollama nor IBM Cloud API succeeded, return a clear connection guidance message:
  return (
    `⚠️ **Unable to connect to live IBM Granite LLM**\n\n` +
    `To generate real, non-predefined AI answers using IBM Granite, please do one of the following:\n\n` +
    `1. **Run IBM Granite locally via Ollama (100% Free)**:\n` +
    `   • Open Terminal / Command Prompt and run:\n` +
    `     \`ollama run granite3-dense:8b\`\n` +
    `   • Ensure Ollama is active on \`http://localhost:11434\`.\n\n` +
    `2. **Connect IBM Cloud watsonx.ai API**:\n` +
    `   • Paste your valid IBM Cloud API Key in your \`.env\` file (\`VITE_IBM_GRANITE_API_KEY=...\`).`
  );
}
