require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
const openaiApiKey = process.env.OPENAI_API_KEY;

const PORT = 3000; // You can change this if needed
//const OPENAI_API_KEY = 'your-openai-api-key-here'; // Replace with your API key //not needed anymorE ?

app.post('/generate-email', async (req, res) => {
    const { topic } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: `Write a professional email about: ${topic}`,
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        const email = response.data.choices[0].text.trim();
        res.json({ email });
    } catch (error) {
        res.status(500).json({ error: 'Error generating email' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));