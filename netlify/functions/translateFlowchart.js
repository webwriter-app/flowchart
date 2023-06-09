const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { messages, max_tokens } = JSON.parse(event.body);

    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        "model": "gpt-3.5-turbo",
        'messages': messages,
        'max_tokens': max_tokens,
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers: headers });

        const translation = response.data.choices[0].message['content'].trim();
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
