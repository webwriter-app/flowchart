const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { graphNodes, prompt, max_tokens, temperature } = JSON.parse(event.body);

    const OPENAI_API_URL = "https://api.openai.com/v1/completions";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        "model": "text-davinci-003",
        'prompt': prompt,
        'max_tokens': max_tokens,
        'temperature': temperature
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers: headers });

        const translation = response.data.choices[0].text.trim();
        console.log(translation)
        return {
            statusCode: 200,
            body: JSON.stringify({ translation }),
        };

    } catch (error) {
        console.error('error', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to translate Flowchart' }),
        };
    }
};