const inputTxt = document.getElementById("input");
const imageContainer = document.getElementById("imageContainer");
const button = document.getElementById("btn");
const IMAGE_COUNT = 6;
const token = "YOUR_API_KEY";

async function query(data) {
    const uniquePrompt = `${data.inputs} (seed: ${data.parameters.seed})`;
    const response = await fetch(
        "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image",
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ ...data, inputs: uniquePrompt }),
        }
    );
    const result = await response.blob();
    return result;
}

function generateRandomSeed() {
    return Math.floor(Math.random() * 1000000);
}

button.addEventListener('click', async function () {
    const prompt = inputTxt.value;

    if (!prompt) {
        alert("Please enter a prompt");
        return;
    }

    imageContainer.innerHTML = ''; // Clear previous images
    button.disabled = true;
    button.textContent = 'Generating...';

    try {
        const imagePromises = [];
        
        for (let i = 0; i < IMAGE_COUNT; i++) {
            const seed = generateRandomSeed();
            imagePromises.push(query({
                inputs: prompt,
                parameters: { seed: seed }
            }).then(response => {
                const objectURL = URL.createObjectURL(response);

                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';

                const img = document.createElement('img');
                img.src = objectURL;
                img.alt = `Generated image ${i + 1}`;

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-btn';
                downloadBtn.textContent = 'Download';
                downloadBtn.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.href = objectURL;
                    link.download = `image_${i + 1}.png`;
                    link.click();
                });

                img.addEventListener('click', () => {
                    previewImage(objectURL, `Generated image ${i + 1}`);
                });

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(downloadBtn);
                imageContainer.appendChild(imgWrapper);
            }));
        }
        
        await Promise.all(imagePromises);
    } catch (error) {
        console.error('Error generating images:', error);
        alert('An error occurred while generating images. Please try again.');
    } finally {
        button.disabled = false;
        button.textContent = 'Generate';
    }
});

function previewImage(src, alt) {
    const modal = document.getElementById("imagePreview");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");

    modal.style.display = "block";
    modalImg.src = src;
    captionText.innerText = alt;

    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
}
