const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { graphNodes } = JSON.parse(event.body);

    const openAiPrompt = graphNodes.map(node => node.text).join(' ');

    const OPENAI_API_URL = "https://api.openai.com/v1/engines/code-davinci-002/completions";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        'prompt': openAiPrompt,
        'max_tokens': 60 
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers: headers });

        // Die generierten Pseudocodes aus der Antwort extrahieren
        const pseudoCode = response.data.choices[0].text.trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ pseudoCode }),
        };

    } catch (error) {
        console.error('error', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to translate to Pseudo Code' }),
        };
    }
};
