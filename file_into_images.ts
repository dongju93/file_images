import * as fs from "fs";
import { createCanvas } from "canvas";

// Directory where the files are located
const directoryPath = "/Users/dong-ju/Documents/My_code/file_images/files/"; // Replace with your actual directory path

// Get list of all files in the directory
const fileNames = fs.readdirSync(directoryPath);

// Loop through each file
fileNames.forEach((fileName) => {
    // Complete file path
    const filePath = `${directoryPath}/${fileName}`;

    // Read the file into binary
    let binaryData: Buffer = fs.readFileSync(filePath);

    // Target size for a 256x256 RGB image
    const targetSize = 256 * 256 * 3;

    if (binaryData.length < targetSize) {
        // Padding if data is smaller
        const padding = Buffer.alloc(targetSize - binaryData.length);
        binaryData = Buffer.concat([binaryData, padding]);
    } else if (binaryData.length > targetSize) {
        // Compress if data is larger
        const step = Math.ceil(binaryData.length / targetSize);
        let compressedData: number[] = [];
        for (let i = 0; i < binaryData.length; i += step) {
            compressedData.push(binaryData[i]);
        }
        binaryData = Buffer.from(compressedData);
    }

    // Create a 256x256 RGB image
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");

    let x = 0,
        y = 0;

    for (let i = 0; i < targetSize; i += 3) {
        const r = binaryData[i];
        const g = binaryData[i + 1];
        const b = binaryData[i + 2];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);

        x++;
        if (x >= 256) {
            x = 0;
            y++;
        }
    }

    // Save to a file with the same filename but with .png extension
    const outputFileName = `/Users/dong-ju/Documents/My_code/file_images/images/malicious/${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}.png`;
    const imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputFileName, imageBuffer);

    console.log(`Image saved for file: ${fileName}`);
});
