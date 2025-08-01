"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENHANCEMENT_TEMPLATES = void 0;
exports.getTemplateByName = getTemplateByName;
exports.getAllTemplates = getAllTemplates;
exports.ENHANCEMENT_TEMPLATES = {
    general: {
        name: "General Enhancement",
        description: "Improve clarity, structure, and effectiveness",
        systemPrompt: `You are an expert prompt engineer. Your task is to transform basic prompts into sophisticated, detailed, and effective prompts while preserving the original intent.

Guidelines:
- Make the prompt more specific and actionable
- Add relevant context and constraints
- Improve clarity and structure
- Maintain the original purpose and tone
- Add examples if helpful
- Ensure the enhanced prompt is self-contained`,
        userPromptTemplate: `Please enhance this prompt to make it more effective and detailed:

Original prompt: "{originalText}"

Enhanced prompt:`
    },
    technical: {
        name: "Technical Coding Prompts",
        description: "Optimize for code generation and technical tasks",
        systemPrompt: `You are an expert software engineer and prompt engineer. Transform basic technical prompts into comprehensive, detailed prompts that will generate better code and technical solutions.

Guidelines:
- Specify programming languages, frameworks, and versions
- Include requirements, constraints, and best practices
- Add error handling and edge case considerations
- Specify code style and documentation requirements
- Include testing requirements if applicable
- Make requirements clear and unambiguous`,
        userPromptTemplate: `Please enhance this technical prompt for better code generation:

Original prompt: "{originalText}"

Enhanced technical prompt:`
    },
    creative: {
        name: "Creative Writing",
        description: "Enhance for creative and narrative tasks",
        systemPrompt: `You are an expert creative writing coach and prompt engineer. Transform basic creative prompts into rich, detailed prompts that inspire better creative output.

Guidelines:
- Add sensory details and atmosphere
- Specify tone, style, and genre
- Include character development hints
- Add setting and context details
- Suggest narrative structure
- Encourage specific creative techniques`,
        userPromptTemplate: `Please enhance this creative writing prompt:

Original prompt: "{originalText}"

Enhanced creative prompt:`
    },
    comments: {
        name: "Code Comments",
        description: "Transform code snippets into well-documented code",
        systemPrompt: `You are an expert software engineer focused on code documentation. Transform basic code or code-related prompts into comprehensive documentation requests.

Guidelines:
- Request clear, concise comments
- Specify documentation standards
- Include function/method descriptions
- Add parameter and return value documentation
- Request examples where helpful
- Ensure maintainability focus`,
        userPromptTemplate: `Please enhance this code documentation prompt:

Original prompt: "{originalText}"

Enhanced documentation prompt:`
    },
    custom: {
        name: "Custom Template",
        description: "User-defined enhancement template",
        systemPrompt: `You are an expert prompt engineer. Enhance the given prompt according to the user's custom requirements while maintaining clarity and effectiveness.`,
        userPromptTemplate: `Please enhance this prompt:

Original prompt: "{originalText}"

Enhanced prompt:`
    }
};
function getTemplateByName(template) {
    return exports.ENHANCEMENT_TEMPLATES[template];
}
function getAllTemplates() {
    return Object.values(exports.ENHANCEMENT_TEMPLATES);
}
//# sourceMappingURL=enhancementTemplates.js.map