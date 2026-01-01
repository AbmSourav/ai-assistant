import { systemInstruction } from "./system-prompts.js"

const systemPrompt = {
    role: "system",
    content: systemInstruction
}

const previousSummary = {
    role: "user",
    content: ""
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

export const setSummaryContext = (prevSummary) => {
	if (! prevSummary) return

	previousSummary.content = `Previous Summary:
${prevSummary}
`
}

export const getPromptHistory = () => {
	if (previousSummary.content) {
		return [systemPrompt, previousSummary, userPrompt]
	}
	return history
}
