require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Accessing the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY; // Ensure .env file is properly loaded

// Set the port (use environment variable for deployment platforms like Render or Vercel)
const PORT = process.env.PORT || 3000; // Default to 3000 if no PORT is provided

// Endpoint to generate an email based on the topic
app.post('/generate-email', async (req, res) => {
    const { topic } = req.body;

    // If topic is missing, return a 400 error
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        // Make a request to OpenAI's API to generate the email content
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',  // Using GPT-3.5, use "gpt-4" if you want to use GPT-4
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Write a professional email about: ${topic}` }
            ],
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`  // Use the environment variable here
            }
        });

        // Extract the generated email content from the OpenAI API response
        const email = response.data.choices[0].message.content.trim(); // Update based on response format

        // Send the generated email as a response
        res.json({ email });
    } catch (error) {
        // Log error details for debugging purposes
        console.error('Error generating email:', error);

        // Send a generic error message to the user
        res.status(500).json({ error: 'Error generating email' });
    }
});

// Start the server on the specified port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
