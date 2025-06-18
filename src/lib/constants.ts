export const DEFAULT_EXTRACTION_PROMPT = `Extract a hierarchical topic tree from the following text. Include ALL explicitly mentioned topics, concepts, named entities, questions, and hypothetical scenarios - even if they are not factual statements.

EXTRACTION RULES:
- Include every topic, concept, named entity, or subject that is mentioned, even if it appears in a question, suggestion, or hypothetical statement.
- Maintain logical hierarchy and grouping.
- Capture specific values, measurements, and names within appropriate categories.
- Do NOT add unmentioned topics or infer content.

HIERARCHY GUIDELINES:
- Group related information under logical main topics.
- Place specific values and names as subtopics under relevant categories.
- Create natural hierarchy depth based on content complexity.

WHAT TO CAPTURE:
- Main concepts, themes, and named entities as top-level topics (e.g., "Cats", "Space", "Mars", "People").
- Questions and hypothetical scenarios as topics (e.g., "Living on Mars", "Cats going to space").
- Specific details, values, and names as subtopics under relevant main topics.
- Individual measurements, names, or values as deeper subtopics when they belong together.

EXAMPLES:
Text: "Hello, my name is Michael. Let's talk about cats going to space. In space, will people ever be able to live on Mars?"
Should produce:
{
  "id": "conversation_overview",
  "topic": "Conversation Overview",
  "accuracy": 1.0,
  "subtopics": [
    {
      "id": "personal_introduction",
      "topic": "Personal Introduction",
      "accuracy": 0.95,
      "subtopics": [
        {
          "id": "personal_introduction_name",
          "topic": "Name",
          "accuracy": 0.9,
          "subtopics": [
            {
              "id": "personal_introduction_name_michael",
              "topic": "Michael",
              "accuracy": 0.95,
              "subtopics": []
            }
          ]
        }
      ]
    },
    {
      "id": "cats",
      "topic": "Cats",
      "accuracy": 0.9,
      "subtopics": [
        {
          "id": "cats_space_travel",
          "topic": "Space Travel",
          "accuracy": 0.85,
          "subtopics": []
        }
      ]
    },
    {
      "id": "space",
      "topic": "Space",
      "accuracy": 0.9,
      "subtopics": [
        {
          "id": "space_living_on_mars",
          "topic": "Living on Mars",
          "accuracy": 0.8,
          "subtopics": [
            {
              "id": "space_living_on_mars_people",
              "topic": "People",
              "accuracy": 0.7,
              "subtopics": []
            }
          ]
        }
      ]
    }
  ]
}

ID FORMAT:
- Use descriptive, lowercase IDs with underscores (e.g., "cats", "space_travel", "living_on_mars").
- Make IDs hierarchical: main_topic -> main_topic_subtopic -> main_topic_subtopic_detail

ACCURACY SCORING:
- 0.9-1.0: Topic discussed with significant detail or emphasis
- 0.7-0.9: Topic clearly mentioned with context
- 0.5-0.7: Topic briefly mentioned but clearly stated
- 0.3-0.5: Topic implied or indirectly referenced

JSON STRUCTURE:
{
  "id": "main_topic_name",
  "topic": "Main Topic Title",
  "accuracy": 0.95,
  "subtopics": [
    {
      "id": "main_topic_specific_item",
      "topic": "Specific Item Name",
      "accuracy": 0.85,
      "subtopics": []
    }
  ]
}

REQUIREMENTS:
- Organize information hierarchically with logical grouping.
- Include ALL specifically named items, values, and measurements within appropriate categories.
- Include all named entities, questions, and hypothetical scenarios as topics.
- Create natural hierarchy depth based on content complexity.
- Do NOT hallucinate or add unmentioned topics.
- Use consistent "subtopics" field name at all levels.

Return ONLY a single JSON object. The top-level node ("root") should be the most representative or overarching topic from the text (for example, "Personal Introduction", "Space Exploration", "Conversation Overview", etc.), not just "root". Only use "root" if there is truly no clear main topic.

Text: \${inputText}`;

export const DEFAULT_VALIDATION_PROMPT = `You are a precision topic extraction validator. Your task is to review and correct the extracted topic tree against the original text.

VALIDATION CHECKLIST:
✓ ACCURACY: Every topic must be explicitly mentioned in the original text
✓ COMPLETENESS: No significant topics should be missing  
✓ HIERARCHY: Parent-child relationships must be logical and appropriate
✓ PRECISION: Accuracy scores should reflect actual topic prominence (0.3-1.0 scale)
✓ CONSISTENCY: IDs should follow pattern: main_topic → main_topic_subtopic → main_topic_subtopic_detail

CORRECTION PRIORITIES:
1. REMOVE any topics not actually present in the text (hallucinations)
2. ADD any major topics that were missed
3. REORGANIZE hierarchy if parent-child relationships are illogical  
4. ADJUST accuracy scores based on how much detail/emphasis each topic receives
5. FIX malformed IDs to follow consistent naming pattern

ACCURACY SCORE GUIDE:
• 0.9-1.0: Topic discussed extensively with multiple details
• 0.7-0.9: Topic clearly mentioned with context and explanation  
• 0.5-0.7: Topic mentioned with some detail
• 0.3-0.5: Topic briefly mentioned or implied

ORIGINAL TEXT:
"\${originalText}"

EXTRACTED TOPIC TREE:
\${topicTree}

INSTRUCTIONS:
- Make surgical corrections - don't change what's already accurate
- Preserve good hierarchical structure where it exists
- Ensure every topic can be traced back to specific text mentions
- Return only the corrected JSON, no explanations or formatting

Return the validated topic tree`;

export const DEFAULT_EXTRACTION_MODEL = "gemini-2.0-flash";
export const DEFAULT_VALIDATION_MODEL = "gemini-2.5-flash";

export const OPENROUTER_MODELS = [
  "moonshotai/kimi-dev-72b:free",
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-r1-0528:free",
  "sarvamai/sarvam-m:free",
  "mistralai/devstral-small:free",
  "google/gemma-3n-e4b-it:free",
  "meta-llama/llama-3.3-8b-instruct:free",
  "nousresearch/deephermes-3-mistral-24b-preview:free",
  "microsoft/phi-4-reasoning-plus:free",
  "microsoft/phi-4-reasoning:free",
  "opengvlab/internvl3-14b:free",
  "opengvlab/internvl3-2b:free",
  "qwen/qwen3-30b-a3b:free",
  "qwen/qwen3-8b:free",
  "qwen/qwen3-14b:free",
  "qwen/qwen3-32b:free",
  "qwen/qwen3-235b-a22b:free",
  "tngtech/deepseek-r1t-chimera:free",
  "microsoft/mai-ds-r1:free",
  "thudm/glm-z1-32b:free",
  "thudm/glm-4-32b:free",
  "shisa-ai/shisa-v2-llama3.3-70b:free",
  "arliai/qwq-32b-arliai-rpr-v1:free",
  "agentica-org/deepcoder-14b-preview:free",
  "moonshotai/kimi-vl-a3b-thinking:free",
  "nvidia/llama-3.3-nemotron-super-49b-v1:free",
  "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
  "meta-llama/llama-4-maverick:free",
  "meta-llama/llama-4-scout:free",
  "deepseek/deepseek-v3-base:free",
  "google/gemini-2.5-pro-exp-03-25",
  "qwen/qwen2.5-vl-32b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "featherless/qwerky-72b:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "open-r1/olympiccoder-32b:free",
  "google/gemma-3-1b-it:free",
  "google/gemma-3-4b-it:free",
  "google/gemma-3-12b-it:free",
  "rekaai/reka-flash-3:free",
  "google/gemma-3-27b-it:free",
  "qwen/qwq-32b:free",
  "nousresearch/deephermes-3-llama-3-8b-preview:free",
  "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
  "cognitivecomputations/dolphin3.0-mistral-24b:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
  "deepseek/deepseek-r1-distill-qwen-32b:free",
  "deepseek/deepseek-r1-distill-qwen-14b:free",
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-coder-32b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.2-1b-instruct:free",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "qwen/qwen-2.5-vl-7b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-nemo:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
];
