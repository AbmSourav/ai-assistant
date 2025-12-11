import { Ollama } from 'ollama'

const ollama = new Ollama({ host: process.env.OLLAMA_API_URL });

export default async function dataEmbed(data) {
    return await ollama.embed({
        model: 'embeddinggemma:300m',
        input: data,
    })
}
