require('dotenv').config(); // Lade Umgebungsvariablen
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const openaiApiKey = process.env.OPENAI_API_KEY;
const expectedCode = process.env.SECURITY_CODE || "X!911";

if (!openaiApiKey) {
    console.error('Missing OpenAI API key in environment variables');
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-email', async (req, res) => {
    console.log('Incoming request body:', req.body);
    const { topic, securityCode, recipient, sender, language } = req.body;

    // Sicherheitscode überprüfen
    if (securityCode !== expectedCode) {
        return res.status(403).json({ error: 'Invalid or missing security code' });
    }

    // Validierung der erforderlichen Felder
    if (!topic || !recipient || !sender || !language) {
        return res.status(400).json({ error: 'All fields (topic, recipient, sender, language) are required.' });
    }

    // Spracheinstellungen für Grußformel und Inhalt
    const greeting = language === 'de' ? 'Viele Grüße' : 'Best regards';
    const userPrompt = language === 'de'
        ? `Schreibe eine professionelle E-Mail über: ${topic}. Die E-Mail soll an ${recipient} gehen und von ${sender} gesendet werden.`
        : `Write a professional email about: ${topic}. The email should be addressed to ${recipient} and sent by ${sender}.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 300
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        });

        let emailContent = response.data?.choices?.[0]?.message?.content?.trim();
        if (!emailContent) {
            throw new Error('Failed to extract email from OpenAI response');
        }

        // Grußformel hinzufügen
        emailContent += `\n\n${greeting},\n${sender}`;

        res.json({ email: emailContent });

    } catch (error) {
        console.error('Error generating email:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Error generating email',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
