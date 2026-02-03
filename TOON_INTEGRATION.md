# TOON Format Integration

## Overview

This RAG system now uses **TOON format** exclusively for all LLM interactions to maximize token efficiency and reduce API costs.

## What is TOON?

TOON (Tree Object Notation) is a human-friendly, token-efficient data serialization format that serves as a compact alternative to JSON. It typically saves **30-50% tokens** compared to JSON.

### Key Features
- **No quotes** needed for most keys and values
- **Compact syntax**: `key: value` instead of `"key": "value"`
- **Array notation**: `items[3]: a,b,c` instead of `"items": ["a", "b", "c"]`
- **Tabular data**: Efficient representation of arrays of objects
- **Indentation-based** structure (like YAML but simpler)

### Example Comparison

**JSON** (156 characters):
```json
{
  "users": [
    {"id": 1, "name": "Alice", "role": "admin"},
    {"id": 2, "name": "Bob", "role": "user"}
  ]
}
```

**TOON** (69 characters):
```toon
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

**Token Savings: ~56%**

## Implementation

### 1. Context Encoding
All context chunks sent to LLMs are encoded in TOON format:
- Knowledge vault fragments
- Retrieved document chunks
- Historical conversation context
- File previews

### 2. LLM Responses
LLMs are instructed to respond in TOON format instead of JSON:
- Research plans from the Strategic Agent Brain
- Thinker Brain analysis outputs
- All structured responses

### 3. Parsing
The `toonService` handles encoding and decoding:
```typescript
// Encoding
const toonStr = toonService.encode(data, { delimiter: '\t', indent: 2 });

// Decoding
const obj = toonService.decode(toonStr);

// Token savings estimation
const savings = toonService.estimateTokenSavings(data);
// { json: 1000, toon: 600, saved: 400, percentage: 40 }
```

### 4. System Instructions
All system prompts now include:
- TOON format examples
- Instructions to output TOON instead of JSON
- Brief TOON syntax explanation

## Benefits

1. **Reduced Token Usage**: 30-50% fewer tokens in typical scenarios
2. **Lower API Costs**: Direct cost reduction proportional to token savings
3. **Faster Processing**: Less data to transmit and process
4. **Same Information**: Lossless conversion - no data is lost

## Files Modified

- `services/toonService.ts` - TOON encoder/decoder implementation
- `services/geminiService.ts` - Updated all methods to use TOON
  - `encodeContextAsTOON()` - Encodes context in TOON format
  - `cleanAndParseTOON()` - Parses TOON responses from LLMs
  - Updated system instructions for all agents
- `types.ts` - Removed `useToonFormat` flag (always enabled)
- `App.tsx` - Removed toggle UI
- `components/RightSidebar.tsx` - Removed toggle control

## Token Savings Log

The console logs token savings for each operation:
```
[TOON] Token savings: 450 tokens (42.3%) - JSON: 1063, TOON: 613
```

## Fallback Behavior

If TOON parsing fails, the system automatically falls back to JSON parsing for backwards compatibility:
```typescript
try {
  return toonService.decode(cleaned);
} catch (toonError) {
  // Fallback to JSON
  return JSON.parse(jsonStr);
}
```

## Reference

Official TOON specification: https://github.com/toon-format/toon
