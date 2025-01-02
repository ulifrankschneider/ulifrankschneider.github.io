require('dotenv').config(); // Lade Umgebungsvariablen
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path'); // Ermöglicht den Zugriff auf den Dateipfad
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());  // Add this line to allow cross-origin requests


// Zugriff auf den OpenAI-API-Schlüssel aus den Umgebungsvariablen
const openaiApiKey = process.env.OPENAI_API_KEY;

// Definiere den Port (Standard auf 3000)
const PORT = process.env.PORT || 3000;

// Stelle statische Dateien aus dem "public" Verzeichnis zur Verfügung
app.use(express.static(path.join(__dirname, 'public')));

// API-Endpunkt zum Generieren von E-Mails basierend auf dem Thema
app.post('/generate-email', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // Change the model if needed
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Write a professional email about: ${topic}` }
            ],
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        });

        const email = response.data.choices[0].text.trim();
        res.json({ email });

    } catch (error) {
        // Detailed error logging
        if (error.response) {
            console.error('Error response from OpenAI:', error.response.data);
            res.status(500).json({
                error: 'Error generating email',
                details: error.response.data
            });
        } else {
            console.error('Unexpected error:', error.message);
            res.status(500).json({ error: 'Unexpected error occurred' });
        }
    }
});


// Starte den Server auf dem angegebenen Port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
