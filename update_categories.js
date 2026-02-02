#!/usr/bin/env node

const fs = require('fs');

// Read the modelService.ts file
const filePath = './services/modelService.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Map single category to categories array
// Add multiple categories where appropriate
const replacements = [
  // FREE MODELS - Update all category: to categories:
  { from: "    category: 'Reasoning'", to: "    categories: ['Reasoning', 'Code']" },
  { from: "    category: 'Balanced'", to: "    categories: ['Balanced', 'Code']" },
  { from: "    category: 'Speed'", to: "    categories: ['Speed', 'Code']" },
  { from: "    category: 'Code'", to: "    categories: ['Code']" },
  { from: "    category: 'Vision'", to: "    categories: ['Vision', 'Code']" },
];

// First pass: do a simple count-based replacement
// We need to be more careful and context-aware
let replacementCount = 0;

// Strategy: Replace the first occurrence of each category pattern to match model characteristics
// But we need to do this carefully to avoid over-replacing

content = content.replace(/category: 'Reasoning'/g, "categories: ['Reasoning']");
content = content.replace(/category: 'Speed'/g, "categories: ['Speed']");
content = content.replace(/category: 'Balanced'/g, "categories: ['Balanced']");
content = content.replace(/category: 'Code'/g, "categories: ['Code']");
content = content.replace(/category: 'Vision'/g, "categories: ['Vision']");

// Now add additional categories for specific models
// Claude models - add Code + Reasoning
content = content.replace(
  /id: 'anthropic\/claude-3\.7-sonnet',\n    name: 'Claude 3\.7 Sonnet',[\s\S]*?categories: \['Code'\]/,
  (match) => match.replace("categories: ['Code']", "categories: ['Code', 'Reasoning']")
);

content = content.replace(
  /id: 'anthropic\/claude-sonnet-4\.5',\n    name: 'Claude Sonnet 4\.5',[\s\S]*?\n    \}/,
  (match) => {
    if (!match.includes('categories:')) {
      return match.replace(/\n    \}/, ",\n    categories: ['Code', 'Reasoning', 'Long Context']\n  }");
    }
    return match;
  }
);

content = content.replace(
  /id: 'anthropic\/claude-haiku-4\.5',\n    name: 'Claude Haiku 4\.5',[\s\S]*?\n    \}/,
  (match) => {
    if (!match.includes('categories:')) {
      return match.replace(/\n    \}/, ",\n    categories: ['Code', 'Speed', 'Budget']\n  }");
    }
    return match;
  }
);

content = content.replace(
  /id: 'anthropic\/claude-3-haiku',\n    name: 'Claude 3 Haiku',[\s\S]*?\n    \}/,
  (match) => {
    if (!match.includes('categories:')) {
      return match.replace(/\n    \}/, ",\n    categories: ['Code', 'Speed', 'Budget']\n  }");
    }
    return match;
  }
);

content = content.replace(
  /id: 'anthropic\/claude-sonnet-4',\n    name: 'Claude Sonnet 4 \(OpenRouter\)',[\s\S]*?categories: \['Code'\]/,
  (match) => match.replace("categories: ['Code']", "categories: ['Code', 'Reasoning']")
);

// Gemini models - add Code + Vision for multimodal or Code + Reasoning
content = content.replace(
  /id: 'gemini-3-pro-preview',[\s\S]*?categories: \['Code'\]/,
  (match) => match.replace("categories: ['Code']", "categories: ['Code', 'Reasoning', 'Long Context']")
);

content = content.replace(
  /id: 'gemini-3-pro-image-preview',[\s\S]*?categories: \['Vision'\]/,
  (match) => match.replace("categories: ['Vision']", "categories: ['Vision', 'Code']")
);

content = content.replace(
  /id: 'gemini-2\.5-pro',[\s\S]*?categories: \['Reasoning'\]/,
  (match) => match.replace("categories: ['Reasoning']", "categories: ['Reasoning', 'Code']")
);

content = content.replace(
  /id: 'gemini-2\.5-flash-image',[\s\S]*?categories: \['Vision'\]/,
  (match) => match.replace("categories: ['Vision']", "categories: ['Vision', 'Code']")
);

// OpenAI GPT models - add Code + Reasoning
content = content.replace(
  /id: 'openai\/gpt-4\.1-mini',[\s\S]*?\n    \}/,
  (match) => {
    if (!match.includes('categories:')) {
      return match.replace(/\n    \}/, ",\n    categories: ['Code', 'Speed', 'Budget']\n  }");
    }
    return match;
  }
);

content = content.replace(
  /id: 'openai\/gpt-4\.1-nano',[\s\S]*?\n    \}/,
  (match) => {
    if (!match.includes('categories:')) {
      return match.replace(/\n    \}/, ",\n    categories: ['Code', 'Speed', 'Budget']\n  }");
    }
    return match;
  }
);

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Categories updated to support multiple values!');
