import 'dotenv/config'; // Load .env file
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// NOTE: In a real app, use dotenv to load these from .env file
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/send-sms', async (req, res) => {
    const { to, message, name, location } = req.body;

    console.log("-----------------------------------------");
    console.log("Received SMS Request:");
    console.log("To:", to);
    console.log("Message:", message);
    console.log("-----------------------------------------");

    if (!to || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // --- REAL SMS INTEGRATION (Using Environment Variables) ---
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

        if (!accountSid || !authToken || !messagingServiceSid) {
            throw new Error("Missing Twilio Configuration in .env file");
        }

        // Dynamically import to ensure compatibility in varied envs
        const tm = await import('twilio');
        const client = tm.default(accountSid, authToken);

        console.log(`Attempting to send real SMS to ${to}...`);

        // Format number to E.164 (Assuming IN +91 if missing)
        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) {
            formattedTo = '+91' + formattedTo;
        }

        const msg = await client.messages.create({
            body: message,
            messagingServiceSid: messagingServiceSid, // Use Service instead of specific number
            to: formattedTo
        });

        console.log("✅ SMS successfully sent! SID:", msg.sid);
        return res.json({ success: true, message: 'SMS Sent Successfully', sid: msg.sid });

    } catch (error) {
        console.error("❌ SMS Failed:", error);
        // Send the specific error message back to the client
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send SMS via Gateway',
            code: error.code // Twilio error code if available
        });
    }
});

app.post('/api/ollama', async (req, res) => {
    const { prompt, model } = req.body;
    const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';

    console.log(`🧠 Sending to Ollama (${model || 'llama3.2'})...`);

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'llama3.2', // Default to llama3.2 as requested
                prompt: prompt,
                stream: false,
                format: "json" // Force JSON mode for structured output
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Ollama Response Received");
        res.json({ success: true, response: data.response });

    } catch (error) {
        console.error("❌ Ollama Connection Failed:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to connect to AI Engine. Ensure Ollama is running.",
            details: error.message
        });
    }
});

app.listen(PORT, async () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);

    // STARTUP CHECK: Validate Twilio Credentials
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
            console.warn("⚠️ Twilio Credentials not found in .env. SMS will fail.");
            return;
        }

        const tm = await import('twilio');
        const client = tm.default(accountSid, authToken);

        console.log("Validating Twilio Credentials...");
        await client.api.accounts(accountSid).fetch();
        console.log("✅ Twilio Connection Verified: Credentials are valid.");
    } catch (error) {
        console.error("❌ Twilio Verification Failed:", error.message);
        console.error("   > Check .env file for correct SID and Token.");
    }
});
