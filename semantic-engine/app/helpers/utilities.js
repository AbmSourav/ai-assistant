import { Ollama } from 'ollama'
import { UpsertParentPointSchema, UpsertPointSchema } from '../types/point.js';

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
