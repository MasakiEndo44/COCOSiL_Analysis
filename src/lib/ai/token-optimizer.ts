/**
 * Token Optimizer for AI Chat
 * Dynamically calculates optimal token allocation based on conversation stage and context
 */

export interface TokenOptimizationParams {
    conversation_stage: 'warmup' | 'exploration' | 'deep_dive' | 'closing';
    message_count: number;
    context_length: number;
    priority?: 'speed' | 'quality';
}

export interface TokenOptimizationResult {
    maxTokens: number;
    reasoning: string;
    costEstimate: number; // in USD
}

/**
 * Stage-based baseline token allocation
 * Based on analysis: warmup needs less, deep_dive needs more
 */
const STAGE_BASELINES = {
    warmup: 400,      // Initial rapport building
    exploration: 600, // Topic exploration
    deep_dive: 800,   // Deep analysis
    closing: 500      // Wrap-up and summary
} as const;

/**
 * Cost per 1K tokens for gpt-4o-mini
 * Input: $0.150 / 1M tokens = $0.00015 / 1K tokens
 * Output: $0.600 / 1M tokens = $0.0006 / 1K tokens
 */
const COST_PER_1K_TOKENS = {
    input: 0.00015,
    output: 0.0006
} as const;

/**
 * Calculate optimal token allocation for AI response
 */
export function calculateOptimalTokens(params: TokenOptimizationParams): TokenOptimizationResult {
    const { conversation_stage, message_count, context_length, priority = 'quality' } = params;

    // 1. Get stage baseline
    const baseline = STAGE_BASELINES[conversation_stage];

    // 2. Apply context multiplier (longer context = more tokens needed for coherent response)
    // Cap at 1.5x to prevent excessive token usage
    const contextMultiplier = Math.min(context_length / 1000, 1.5);

    // 3. Apply message count factor (early conversation = more explanation needed)
    // Decreases as conversation progresses
    const messageCountFactor = message_count < 5 ? 1.2 : 1.0;

    // 4. Apply priority modifier
    const priorityModifier = priority === 'speed' ? 0.8 : 1.0;

    // 5. Calculate final token count
    const calculatedTokens = baseline * contextMultiplier * messageCountFactor * priorityModifier;

    // 6. Round and enforce bounds (min: 300, max: 1000)
    const maxTokens = Math.round(Math.max(300, Math.min(calculatedTokens, 1000)));

    // 7. Estimate cost (assuming average input context of 2000 tokens)
    const estimatedInputTokens = context_length;
    const estimatedOutputTokens = maxTokens;
    const costEstimate =
        (estimatedInputTokens / 1000) * COST_PER_1K_TOKENS.input +
        (estimatedOutputTokens / 1000) * COST_PER_1K_TOKENS.output;

    // 8. Generate reasoning
    const reasoning = `Stage: ${conversation_stage} (baseline: ${baseline}) × Context: ${contextMultiplier.toFixed(2)} × Messages: ${messageCountFactor} × Priority: ${priorityModifier} = ${maxTokens} tokens`;

    return {
        maxTokens,
        reasoning,
        costEstimate
    };
}

/**
 * Helper: Get conversation stage from message count
 */
export function getConversationStage(messageCount: number): TokenOptimizationParams['conversation_stage'] {
    if (messageCount <= 3) return 'warmup';
    if (messageCount <= 8) return 'exploration';
    if (messageCount <= 15) return 'deep_dive';
    return 'closing';
}

/**
 * Helper: Estimate context length from messages
 * Rough estimate: 1 token ≈ 0.75 words, 1 word ≈ 5 characters (Japanese)
 */
export function estimateContextLength(messages: Array<{ content: string }>): number {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.round(totalChars / 5 * 0.75); // chars → words → tokens
}
