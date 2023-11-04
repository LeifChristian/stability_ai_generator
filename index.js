
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const engineId = 'stable-diffusion-v1-5';
const apiHost = 'https://api.stability.ai';
const apiKey = process.env.API_KEY;
// console.log(apiKey, 'EEEEE')
const outDirectory = path.join(__dirname, 'out');

// Create the "out" directory if it doesn't exist
if (!fs.existsSync(outDirectory)) {
	fs.mkdirSync(outDirectory);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// app.post('/generate-image', async (req, res) => {
// 	const { password, text } = req.body;

// 	if (password !== 'your_password_here') {
// 		return res.status(401).json({ error: 'Invalid password.' });
// 	}

// 	try {
// 		if (!apiKey) {
// 			throw new Error('Missing Stability API key.');
// 		}

// 		const response = await axios.post(
// 			`${apiHost}/v1/generation/${engineId}/text-to-image`,
// 			{
// 				text_prompts: [
// 					{
// 						text,
// 					},
// 				],
// 				cfg_scale: 7,
// 				clip_guidance_preset: 'FAST_BLUE',
// 				height: 512,
// 				width: 512,
// 				samples: 1,
// 				steps: 30,
// 			},
// 			{
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Accept: 'application/json',
// 					Authorization: `Bearer ${apiKey}`,
// 				},
// 			}
// 		);

// 		if (response.status !== 200) {
// 			throw new Error(`Non-200 response: ${response.data}`);
// 		}

// 		const imageBase64 = response.data.artifacts[0].base64;
// 		const imageBuffer = Buffer.from(imageBase64, 'base64');
// 		const imagePath = path.join(outDirectory, `${Date.now()}.png`);

// 		fs.writeFileSync(imagePath, imageBuffer);

// 		const files = fs.readdirSync(outDirectory);
// 		const imageUrls = files.map((file) => {
// 			return `${req.protocol}://${req.get('host')}/out/${file}`;
// 		});

// 		res.json({ imageUrl: imagePath, imageUrls });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({ error: 'An error occurred while generating the image.' });
// 	}
// });


app.get('/get-images', (req, res) => {
	const files = fs.readdirSync(outDirectory);
	const imageUrls = files.map((file) => {
	  return `${req.protocol}://${req.get('host')}/out/${file}`;
	});
  
	const imageList = imageUrls.map((url, index) => {
	  return {
		name: `image${index + 1}.png`,
		url: url
	  };
	});
  
	res.json({ images: imageList });
  });
  

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
		console.log(text, 'thetext?')
		const imagePath = path.join(outDirectory, `${text.slice(0, 25)}.png`);

		fs.writeFileSync(imagePath, imageBuffer);

		const files = fs.readdirSync(outDirectory);
		const imageUrls = files.map((file) => {
			return `${req.protocol}://${req.get('host')}/out/${file}`;
		});

		// Send the image URLs as a response
		res.json({ imageUrls });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while generating the image.' });
	}
});



app.post('/delete-image', async (req, res) => {
	const { password, text } = req.body;

	console.log(text, 'text to backend')

	if (password !== 'your_password_here') {
		return res.status(401).json({ error: 'Invalid password.' });
	}

	try {
		// var filePath = 'c:/book/discovery.docx'; 
		// fs.unlinkSync(filePath);
		console.log(outDirectory, 'directory/path')
		const files = fs.readdirSync(outDirectory);

		if (fs.existsSync(`${outDirectory}/${text}`)) {
			// File exists, so delete it
			fs.unlinkSync(`${outDirectory}/${text}`);
		  } else {
			console.log('The file does not exist.');
		  }

		console.log(files, 'files')
		const imageUrls = files.map((file) => {
			return `${req.protocol}://${req.get('host')}/out/${file}`;
		});

		// Send the image URLs as a response
		res.json({ imageUrls });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while generating the image.' });
	}
});


// Serve the images at the /out directory
app.use('/out', express.static(outDirectory));

app.listen(3000, () => {
	console.log('Server started on port 3000');
});
