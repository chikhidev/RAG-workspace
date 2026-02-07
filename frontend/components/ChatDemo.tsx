import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { Message, PipelineStatus } from '../types';

interface DemoScenario {
  question: string;
  planning: string;
  searching: string;
  foundContext: string;
  synthesizing: string;
  answer: string;
}

const scenarios: DemoScenario[] = [
  {
    question: 'How do we declare a function in Python?',
    planning: 'User is asking about Python function declarations. I should search the uploaded documentation for function syntax and examples. Will perform a semantic search for "function declaration" in Python-related documents.',
    searching: 'Performing semantic search for "function declaration" across Python documentation. Targeting Python Getting Started.pdf and Python Reference.pdf with query: "how to declare define function def keyword syntax"',
    foundContext: 'Retrieved 3 highly relevant sections:\n• Python Getting Started.pdf (pages 12-13): Function basics and def keyword\n• Python Getting Started.pdf (page 45): Function parameters and return values\n• Python Reference.pdf (page 203): Advanced function features',
    synthesizing: 'Analyzing retrieved context. Key information identified: def keyword syntax, function naming conventions, parameter passing, return statements, and basic examples. Have sufficient context to provide comprehensive answer.',
    answer: `In Python, you declare a function using the \`def\` keyword, followed by the function name and parentheses. Here's the basic syntax:

\`\`\`python
def function_name(parameters):
    """Optional docstring describing the function"""
    # function body
    return value
\`\`\`

### Key Components:

1. **def keyword**: Indicates the start of a function definition
2. **function_name**: Should be lowercase with words separated by underscores (snake_case)
3. **parameters**: Optional inputs in parentheses, separated by commas
4. **colon**: Ends the function signature line
5. **indented block**: The function body (typically 4 spaces)
6. **return statement**: Optional, returns a value to the caller

### Example:

\`\`\`python
def greet(name, greeting="Hello"):
    """Greet someone with a custom or default greeting"""
    message = f"{greeting}, {name}!"
    return message

# Usage
result = greet("Alice")  # Returns: "Hello, Alice!"
result = greet("Bob", "Hi")  # Returns: "Hi, Bob!"
\`\`\`

Functions without a return statement implicitly return \`None\`.`
  },
  {
    question: 'who is eren',
    planning: 'User is asking about "eren" - likely referring to a character. I should search uploaded documents for any mentions of this name. Will perform both semantic and grep searches to locate relevant context.',
    searching: 'Performing grep search for "eren" across all documents. Also running semantic search with query: "eren character protagonist background story"',
    foundContext: 'Retrieved 2 relevant sections:\n• Anime_Notes.pdf (page 7): Character profile and background\n• Story_Summary.txt (lines 142-156): Key plot points involving this character',
    synthesizing: 'Analyzing character information from uploaded documents. Found details about Eren Yeager from Attack on Titan series. Extracting key biographical and narrative information.',
    answer: `Based on the uploaded documents, **Eren Yeager** is the main protagonist of the Attack on Titan series.

### Key Information:

**Background:**
- Born in Shiganshina District
- Witnessed his mother's death during the fall of Wall Maria
- Joined the Survey Corps to fight Titans

**Abilities:**
- Can transform into a Titan (Attack Titan)
- Possesses the Founding Titan power
- Has the ability to see future and past memories

**Personality:**
- Driven by a strong desire for freedom
- Initially motivated by revenge
- Evolves significantly throughout the series

The character is known for his complex development and controversial decisions in the later story arcs.`
  },
  {
    question: 'what is inside @Minecraft.pdf',
    planning: 'User is asking about the contents of a specific document: Minecraft.pdf. They used @ syntax to reference it. I should read lines from this file and provide a comprehensive overview of its contents.',
    searching: 'Reading initial sections of Minecraft.pdf to understand document structure and content. Will extract table of contents, main topics, and key sections.',
    foundContext: 'Retrieved document overview:\n• Minecraft.pdf (pages 1-3): Introduction and getting started guide\n• Minecraft.pdf (pages 10-25): Building mechanics and crafting recipes\n• Minecraft.pdf (pages 30-42): Redstone circuits and automation',
    synthesizing: 'Analyzing document structure. Contains comprehensive game guide covering basics, building, crafting, redstone mechanics, and advanced techniques. Organizing content by major sections for clear overview.',
    answer: `The document **Minecraft.pdf** contains a comprehensive guide to Minecraft gameplay. Here's what's inside:

### Main Sections:

**1. Getting Started (Pages 1-9)**
- Basic controls and interface
- First night survival tips
- Essential tools and crafting

**2. Building & Construction (Pages 10-25)**
- Building materials and properties
- Architectural techniques
- Structure ideas and blueprints

**3. Crafting Recipes (Pages 26-29)**
- Complete crafting table reference
- Tool and weapon recipes
- Potion brewing guide

**4. Redstone Engineering (Pages 30-42)**
- Redstone basics and components
- Logic gates and circuits
- Automation systems

**5. Advanced Gameplay (Pages 43-58)**
- Enchanting and anvils
- Nether and End dimensions
- Boss fights and strategies

The document appears to be a detailed player handbook covering both beginner and advanced topics.`
  },
  {
    question: 'what is in the 5th line of Cakes.txt?',
    planning: 'User is asking for a specific line from a text file: line 5 of Cakes.txt. This requires precise line reading. I will use the read_lines action to extract exactly line 5 from this file.',
    searching: 'Using read_lines action on Cakes.txt, targeting line 5 specifically. This will give us the exact content without ambiguity.',
    foundContext: 'Successfully read Cakes.txt:\n• Line 5 contains: "3. Red Velvet Cake - Rich cocoa flavor with cream cheese frosting"',
    synthesizing: 'Retrieved exact line content. Line 5 is part of what appears to be a numbered list of cake varieties with descriptions.',
    answer: `The 5th line of **Cakes.txt** contains:

\`\`\`
3. Red Velvet Cake - Rich cocoa flavor with cream cheese frosting
\`\`\`

This appears to be the third item in a list of cake varieties, with Red Velvet Cake being described by its characteristic cocoa flavor and cream cheese frosting.`
  },
  {
    question: 'Summerize me @Python_00.md',
    planning: 'User wants a summary of Python_00.md document. They used @ syntax to reference it. I should read through the document to understand its main topics and provide a concise summary of the key points covered.',
    searching: 'Reading Python_00.md document structure. Extracting headings, main topics, and key code examples to create comprehensive summary.',
    foundContext: 'Retrieved document sections:\n• Python_00.md (lines 1-45): Introduction to Python syntax basics\n• Python_00.md (lines 50-120): Variables, data types, and operators\n• Python_00.md (lines 125-200): Control flow and loops',
    synthesizing: 'Analyzing document content. This appears to be an introductory Python tutorial covering fundamentals. Organizing key concepts and examples into digestible summary format.',
    answer: `Here's a summary of **Python_00.md**:

### 📚 Introduction to Python Basics

This document is a beginner-friendly Python tutorial covering fundamental concepts:

**Core Topics:**

1. **Python Syntax** - Indentation rules, comments, and code structure
2. **Variables & Data Types** - Integers, floats, strings, booleans, and lists
3. **Operators** - Arithmetic, comparison, logical, and assignment operators
4. **Control Flow** - if/elif/else statements and conditional logic
5. **Loops** - for and while loops with examples

**Key Takeaways:**
- Python uses indentation (4 spaces) for code blocks
- Variables are dynamically typed (no declaration needed)
- Lists are versatile and support various operations
- Control flow allows decision-making in programs
- Loops enable repetitive tasks efficiently

**Example Code Included:**
The document contains numerous code snippets demonstrating each concept, from basic variable assignment to complex nested loops.

**Target Audience:** Complete beginners with no prior programming experience.`
  }
];

export const ChatDemo: React.FC<{ start?: boolean }> = ({ start = true }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const hasStartedRef = useRef(false);
  
  // Randomly select a scenario once on mount or replay
  const scenario = useMemo(() => scenarios[Math.floor(Math.random() * scenarios.length)], [replayKey]);

  useEffect(() => {
    if (!start || hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    // Step 0: Show user question
    const step0 = setTimeout(() => {
      setMessages([{
        id: 'demo-user',
        role: 'user',
        content: scenario.question,
        timestamp: new Date(),
      }]);
      setCurrentStep(1);
    }, 500);

    return () => clearTimeout(step0);
  }, [start, scenario, replayKey]);

  const handleReplay = () => {
    setMessages([]);
    setCurrentStep(0);
    hasStartedRef.current = false;
    setReplayKey(prev => prev + 1);
  };

  useEffect(() => {
    if (currentStep === 0) return;
    
    // Safety check - if we shouldn't be running but somehow step advanced, stop?
    // Actually once started, let it finish? Usually better UX to let it finish or pause.
    // Given the request "don't start... untill scroll", implies start triggers sequence.
    
    const timers: NodeJS.Timeout[] = [];

    // Step 1: Start with planning
    if (currentStep === 1) {
      timers.push(setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'demo-assistant',
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          status: 'reasoning',
          thoughtLogs: [{
            timestamp: Date.now(),
            step: 'PLANNING',
            thought: scenario.planning,
          }],
          modelId: 'anthropic/claude-sonnet-4',
        }]);
        setCurrentStep(2);
      }, 800));
    }

    // Step 2: Add searching step
    if (currentStep === 2) {
      timers.push(setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.status = 'searching' as PipelineStatus;
          lastMsg.thoughtLogs = [
            ...(lastMsg.thoughtLogs || []),
            {
              timestamp: Date.now(),
              step: 'SEARCHING',
              thought: scenario.searching,
            },
          ];
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
        setCurrentStep(3);
      }, 1500));
    }

    // Step 3: Found results
    if (currentStep === 3) {
      timers.push(setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.thoughtLogs = [
            ...(lastMsg.thoughtLogs || []),
            {
              timestamp: Date.now(),
              step: 'FOUND CONTEXT',
              thought: scenario.foundContext,
            },
          ];
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
        setCurrentStep(4);
      }, 1200));
    }

    // Step 4: Synthesizing
    if (currentStep === 4) {
      timers.push(setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.status = 'synthesizing' as PipelineStatus;
          lastMsg.thoughtLogs = [
            ...(lastMsg.thoughtLogs || []),
            {
              timestamp: Date.now(),
              step: 'SYNTHESIZING',
              thought: scenario.synthesizing,
            },
          ];
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
        setCurrentStep(5);
      }, 1400));
    }

    // Step 5: Complete with answer
    if (currentStep === 5) {
      timers.push(setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };
          lastMsg.status = 'completed' as PipelineStatus;
          lastMsg.content = scenario.answer;
          lastMsg.reasoningDuration = 3.8;
          newMessages[newMessages.length - 1] = lastMsg;
          return newMessages;
        });
        setCurrentStep(6);
      }, 1600));
    }

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentStep, scenario]);

  return (
    <div className="h-[600px] overflow-hidden relative group">
      <ChatInterface
        messages={messages}
        selectedModelId="anthropic/claude-sonnet-4"
        onRetry={() => {}}
        onRegenerate={() => {}}
        onClearChat={() => {}}
        inputValue=""
        setInputValue={() => {}}
        onSend={() => {}}
        onStop={() => {}}
        isProcessing={currentStep < 6}
        onClarifyAnswer={() => {}}
        onMaxIterationsDecision={() => {}}
        maxAgentIterations={10}
        availableDocuments={[]}
        onHistoryNav={() => {}}
      />
      
      {currentStep === 6 && (
        <div className="absolute top-4 left-4 z-20 animate-fade-in">
          <button
            onClick={handleReplay}
            title="Replay Simulation"
            className="p-2.5 rounded-full bg-brand-accent text-white shadow-lg hover:bg-brand-accent/90 transition-all hover:scale-105 backdrop-blur-sm"
            aria-label="Replay simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
