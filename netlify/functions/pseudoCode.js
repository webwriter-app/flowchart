const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { graphNodes } = JSON.parse(event.body);

    // Hier können Sie den Inhalt von graphNodes in das gewünschte Format konvertieren, 
    // das an OpenAI gesendet werden soll.

    // Beispiel: 
    const openAiPrompt = graphNodes.map(node => node.text).join(' ');

    // Setzen Sie Ihre OpenAI-Schlüssel und Einstellungen
    const OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        'prompt': openAiPrompt,
        'max_tokens': 60 // Sie können die Anzahl der Tokens anpassen
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
