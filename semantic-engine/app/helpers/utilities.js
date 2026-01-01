import { Ollama } from 'ollama'
import { UpsertParentPointSchema, UpsertPointSchema } from '../types/point.js';
import { getPromptHistory } from '../retrieval/services/prompt-augmentation.js';
import { systemSummaryInstruction } from '../retrieval/services/system-prompts.js';

const ollama = new Ollama({ host: process.env.OLLAMA_API_URL });

export async function dataEmbed(data) {
    try {
        return await ollama.embed({
            model: 'embeddinggemma:300m',
            input: data,
        });
    } catch (error) {
        throw new Error(
            `Cannot connect to Ollama server at ${process.env.OLLAMA_API_URL}. ` +
            `Please ensure the Ollama server is running.`
        );
    }
}

export async function chat() {
    try {
        return await ollama.chat({
            model: 'llama3.1',
            messages: getPromptHistory(),
        });
    } catch (error) {
        console.error("content generation error:", error)
    }
}

export async function chatSummary({query, previousSummary, generatedContent}) {
	const messages = [{
		role: "system",
		content: systemSummaryInstruction
	}]

	if (previousSummary) {
		messages.push({
			role: "user",
			content: `Previous Summary: \n${previousSummary}`
		})
	}

	messages.push({
		role: "user",
		content: `USER: ${query}. \nAI: ${generatedContent}`
	})

	try {
		return await ollama.chat({
			model: 'llama3.1',
			messages
		});
	} catch (error) {
		console.error("content generation error:", error)
	}
}

export function preparePoint({id, vector, payload, index = 0}) {
    const point = { id, vector, payload };

    let validate = null
    if (index === 0) {
        validate = UpsertParentPointSchema.safeParse(point)
    } else {
        validate = UpsertPointSchema.safeParse(point)
    }

    if (!validate?.success) {
        throw new Error(`Point validation failed: ${validate.error.message}`)
    }

    return validate.data;
}
