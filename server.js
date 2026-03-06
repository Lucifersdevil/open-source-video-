// Video Generation API using Replicate
// Add your Replicate API key in Vercel dashboard: REPLICATE_API_KEY

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    const { prompt, model, duration } = req.body;
    
    // Get API key from environment variable
    const apiKey = process.env.REPLICATE_API_KEY;
    
    if (!apiKey) {
        return res.json({
            success: true,
            message: "Demo mode - API key not configured",
            prompt,
            model,
            duration,
            note: "Add REPLICATE_API_KEY in Vercel to enable video generation"
        });
    }
    
    try {
        // Start prediction with Replicate
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: '8be0d3eb23d6833a6510b8b3af2108577f0d9d4e5a3b3e3e3e3e3e3e3e3e3e3', // SVI model version
                input: {
                    prompt: prompt,
                    num_frames: duration === '10' ? 81 : 41,
                    fps: 8,
                    motion_bucket_id: 127
                }
            })
        });
        
        const data = await response.json();
        
        // Return the prediction ID for polling
        res.json({
            success: true,
            predictionId: data.id,
            status: 'processing'
        });
        
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Check prediction status
app.get('/api/status/:id', async (req, res) => {
    const apiKey = process.env.REPLICATE_API_KEY;
    
    try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
            headers: {
                'Authorization': `Token ${apiKey}`
            }
        });
        
        const data = await response.json();
        
        res.json({
            status: data.status,
            output: data.output
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
