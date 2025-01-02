require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();


const cors = require('cors');
app.use(cors());  // Add this line to allow cross-origin requests

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body); // Dies gibt den Körper der POST-Anfrage aus
    next(); // Weiter zur nächsten Middleware oder Route
});


app.use(bodyParser.json());

// Accessing the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY; // Ensure .env file is properly loaded

// Set the port (use environment variable for deployment platforms like Render or Vercel)
const PORT = process.env.PORT || 3000; // Default to 3000 if no PORT is provided
console.log(`Message from USC`); //to delete


//the following is to test the routing
/*app.get('/', (req, res) => {
    console.log('GET / called');
    res.send('Server is working!');
});*/ 


// Endpoint to generate an email based on the topic
app.post('/generate-email', async (req, res) => {
    console.log('POST /generate-email called'); // Log für den Routenaufruf

    const { topic } = req.body;
    console.log('Request body:', req.body); // Log für den Body der Anfrage

    if (!topic) {
        console.error('No topic provided'); // Log bei fehlendem Topic
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Write a professional email about: ${topic}` }
            ],
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const email = response.data.choices[0].message.content.trim();
        console.log('Generated email:', email); // Log für die Antwort der OpenAI-API
        res.json({ email });
    } catch (error) {
        console.error('Error generating email:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error generating email' });
    }
});


// Start the server on the specified port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

