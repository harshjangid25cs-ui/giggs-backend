import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { GoogleGenAI } from "npm:@google/genai";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // CORS are handled automatically, but we ensure to return JSON correctly
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { action, payload } = await req.json();

      const apiKey = Deno.env.get('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });

      if (action === 'forecast') {
        const prompt = `Based on the following historical hot-spot visits data: \n${JSON.stringify(payload.visits)}\n\nAct as an expert workforce manager. Generate a highly actionable 3-bullet point plan (short and punchy) on how to re-distribute workers this Saturday for peak demand. Focus on the most urgent categories like HVAC or Plumbing. Return only the plan in plain text without markdown or prefixes. Format exactly like this:\n\n1. Pre-position... (reasoning)\n\n2. Extend shift... (reasoning)\n\n3. Rebalance... (reasoning)`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        return new Response(JSON.stringify({ forecast: response.text }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'match') {
        const prompt = `You are an AI Matching Engine. I have a new service visit request: ${JSON.stringify(payload.visit)}.\n\nHere are the available pros: \n${JSON.stringify(payload.candidates)}\n\nRank these pros based on proximity (distance) and skill (rating) matching the visit requirements. Output a JSON array of strings containing ONLY their IDs ordered from best match to worst match. Do NOT output anything else (e.g. no markdown fences like \`\`\`json). Just the raw array.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        let ranking;
        try {
          ranking = JSON.parse(response.text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, ''));
        } catch (e) {
          ranking = payload.candidates.map((c: any) => c.id);
        }
        
        return new Response(JSON.stringify({ ranking }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }),
};
