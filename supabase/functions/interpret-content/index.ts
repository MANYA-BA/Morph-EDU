import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterpretedSection {
  title: string;
  explanation: string;
  keyPoints: string[];
  type: 'concept' | 'definition' | 'example' | 'procedure' | 'summary';
}

interface InterpretedContent {
  topic: string;
  overview: string;
  sections: InterpretedSection[];
  contentType: 'text' | 'diagram' | 'flowchart' | 'notes' | 'graph' | 'table' | 'mixed';
  spatialDescription?: string; // For images - describes layout and relationships
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, sourceType, isImage } = await req.json();

    if (!rawText || rawText.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content provided for interpretation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Different prompts for text vs image content
    const systemPrompt = isImage 
      ? `You are an educational content interpreter specializing in visual materials. Your task is to analyze OCR-extracted text from images (diagrams, flowcharts, handwritten notes, graphs, etc.) and create a clear, educational explanation.

For image content, you must:
1. Infer what TYPE of visual this is (diagram, flowchart, notes, graph, table, etc.)
2. Describe the SPATIAL LAYOUT and how elements relate to each other
3. Explain what the visual is teaching or representing
4. Create a verbal substitute that a blind person could understand

Your explanation must work as a complete replacement for seeing the image.`
      : `You are an educational content interpreter. Your task is to analyze raw educational text and transform it into clear, structured learning content.

For text content, you must:
1. Identify the main TOPIC being taught
2. Break content into logical SECTIONS with clear explanations
3. Remove noise (page numbers, OCR artifacts, formatting garbage)
4. Explain each section in simple, educational language
5. Extract key points and learning objectives`;

    const userPrompt = isImage
      ? `Analyze this OCR-extracted text from an image and create an educational interpretation:

---
${rawText.slice(0, 15000)}
---

Return a JSON object with:
{
  "topic": "What this image/visual is about",
  "overview": "Brief explanation of what this visual represents and teaches",
  "contentType": "diagram" | "flowchart" | "notes" | "graph" | "table" | "mixed",
  "spatialDescription": "Detailed description of how visual elements are arranged and relate to each other - positions, connections, groupings",
  "sections": [
    {
      "title": "Section/component name",
      "explanation": "What this part means and teaches",
      "keyPoints": ["Key point 1", "Key point 2"],
      "type": "concept" | "definition" | "example" | "procedure" | "summary"
    }
  ]
}`
      : `Analyze this educational content and create a structured interpretation:

---
${rawText.slice(0, 15000)}
---

Return a JSON object with:
{
  "topic": "Main topic being taught",
  "overview": "2-3 sentence overview of the content",
  "contentType": "text",
  "sections": [
    {
      "title": "Section title",
      "explanation": "Clear explanation in simple educational language",
      "keyPoints": ["Key point 1", "Key point 2"],
      "type": "concept" | "definition" | "example" | "procedure" | "summary"
    }
  ]
}

Clean up OCR artifacts, remove page numbers, and focus on the educational meaning.`;

    console.log('Calling Lovable AI for content interpretation...');
    console.log('Source type:', sourceType, 'Is image:', isImage);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "interpret_content",
              description: "Return structured educational interpretation of the content",
              parameters: {
                type: "object",
                properties: {
                  topic: { type: "string", description: "Main topic being taught" },
                  overview: { type: "string", description: "Brief overview of the content" },
                  contentType: { 
                    type: "string", 
                    enum: ["text", "diagram", "flowchart", "notes", "graph", "table", "mixed"]
                  },
                  spatialDescription: { 
                    type: "string", 
                    description: "For images: how visual elements are arranged and relate" 
                  },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        explanation: { type: "string" },
                        keyPoints: { type: "array", items: { type: "string" } },
                        type: { 
                          type: "string", 
                          enum: ["concept", "definition", "example", "procedure", "summary"] 
                        }
                      },
                      required: ["title", "explanation", "keyPoints", "type"]
                    }
                  }
                },
                required: ["topic", "overview", "contentType", "sections"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "interpret_content" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service rate limited. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service credits exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI interpretation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return structured content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const interpreted: InterpretedContent = JSON.parse(toolCall.function.arguments);
    console.log('Content interpreted successfully:', interpreted.topic);

    return new Response(
      JSON.stringify({ success: true, data: interpreted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in interpret-content:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Content interpretation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
