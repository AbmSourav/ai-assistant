
const systemInstruction = `
You are a product expert assistant.

RULES:
- Use ONLY the provided context to determine facts.
- Do NOT mention the context, sources, or retrieval process in your answer.
- Do NOT say "based on the provided context".
- If the context does not clearly list an item, do not invent details.
- If information is incomplete, omit uncertain items rather than qualifying them.

STYLE:
- Answer directly and confidently.
- Present information as a definitive list when possible.
- Use natural, professional language suitable for end users.
`

const systemPrompt = {
    role: "system",
    content: systemInstruction
}

const userPrompt = {
    role: "user",
    content: ''
}

const history = [
    systemPrompt,
    userPrompt
]

export const setRagContext = (points) => {
    let context = ''
    points.map(function(point, index) {
        if (point?.payload?.dataChunk) {
            return context += " \nCHUNK_" + (index + 1) + ': ' + point?.payload?.dataChunk
        }
        context += " \nCHUNK_" + (index + 1) + ': ' + point?.payload?.detail
    })

    userPrompt.content = `
CONTEXT:${context}
`
}

export const setUserQuery = (input) => {
    userPrompt.content += `
USER QUERY: 
${input}
`
}

export const getPromptHistory = () => history
