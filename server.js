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
        // --- REAL SMS INTEGRATION ---
        const accountSid = "ACa7f7f675bb8a8a0fdcfe28ebb58fbe55";
        const authToken = "d8db6c85e2d2a19d7dc4aec5a1e0ea24";
        const fromNumber = "+16084077995";

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
            from: fromNumber,
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

app.listen(PORT, async () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);

    // STARTUP CHECK: Validate Twilio Credentials
    try {
        const accountSid = "ACa7f7f675bb8a8a0fdcfe28ebb58fbe55";
        const authToken = "d8db6c85e2d2a19d7dc4aec5a1e0ea24";
        const tm = await import('twilio');
        const client = tm.default(accountSid, authToken);

        console.log("Validating Twilio Credentials...");
        await client.api.accounts(accountSid).fetch();
        console.log("✅ Twilio Connection Verified: Credentials are valid.");
    } catch (error) {
        console.error("❌ Twilio Verification Failed:", error.message);
        console.error("   > Check Account SID and Auth Token.");
    }
});
