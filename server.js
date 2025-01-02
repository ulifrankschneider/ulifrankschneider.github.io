require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Accessing the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY; // Make sure .env file is properly loaded

const PORT = 3000; // Port where your server will run

// Endpoint to generate an email based on the topic
app.post('/generate-email', async (req, res) => {
    const { topic } = req.body;

    // If topic is missing, return a 400 error
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        // Make a request to OpenAI's API to generate the email content
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',  // You can use another model like GPT-4 if available
            prompt: `Write a professional email about: ${topic}`,
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`  // Use the environment variable here
            }
        });

        // Extract the generated email content from the OpenAI API response
        const email = response.data.choices[0].text.trim();

        // Send the generated email as a response
        res.json({ email });
    } catch (error) {
        console.error('Error generating email:', error);
        res.status(500).json({ error: 'Error generating email' });
    }
});

// Start the server on the specified port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
