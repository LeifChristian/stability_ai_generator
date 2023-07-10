
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const engineId = 'stable-diffusion-v1-5';
const apiHost = 'https://api.stability.ai';
const apiKey = 'sk-qVS28DBEWfsjMwHUSeF7bd0qbIucEftzkUSGMh94os8GKWdV';
const outDirectory = path.join(__dirname, 'out');

// Create the "out" directory if it doesn't exist
if (!fs.existsSync(outDirectory)) {
	fs.mkdirSync(outDirectory);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post('/generate-image', async (req, res) => {
	const { password, text } = req.body;

	if (password !== 'your_password_here') {
		return res.status(401).json({ error: 'Invalid password.' });
	}

	try {
		if (!apiKey) {
			throw new Error('Missing Stability API key.');
		}

		const response = await axios.post(
			`${apiHost}/v1/generation/${engineId}/text-to-image`,
			{
				text_prompts: [
					{
						text,
					},
				],
				cfg_scale: 7,
				clip_guidance_preset: 'FAST_BLUE',
				height: 512,
				width: 512,
				samples: 1,
				steps: 30,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
			}
		);

		if (response.status !== 200) {
			throw new Error(`Non-200 response: ${response.data}`);
		}

		const imageBase64 = response.data.artifacts[0].base64;
		const imageBuffer = Buffer.from(imageBase64, 'base64');
		const imagePath = path.join(outDirectory, `${Date.now()}.png`);

		fs.writeFileSync(imagePath, imageBuffer);

		res.json({ imageUrl: imagePath });

		
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while generating the image.' });
	}
});

app.listen(3000, () => {
	console.log('Server started on port 3000');
});
