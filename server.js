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

    // Wenn das Thema fehlt, gebe einen Fehler zurück
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        // Anfrage an OpenAI-API zur Generierung des E-Mail-Inhalts
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-3.5-turbo',  // Verwende GPT-3.5, nutze "gpt-4", wenn du GPT-4 verwenden möchtest
            prompt: `Write a professional email about: ${topic}`,
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`  // Nutze den Umgebungsvariablen-Schlüssel hier
            }
        });

        // Extrahiere den generierten E-Mail-Inhalt aus der OpenAI-Antwort
        const email = response.data.choices[0].text.trim(); // Update basierend auf der Antwortstruktur

        // Sende die generierte E-Mail als Antwort zurück
        res.json({ email });
    } catch (error) {
        // Fehlerprotokollierung für Debugging
        console.error('Error generating email:', error);

        // Sende eine generische Fehlermeldung zurück
        res.status(500).json({ error: 'Error generating email' });
    }
});

// Starte den Server auf dem angegebenen Port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
