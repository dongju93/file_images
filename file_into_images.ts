import * as fs from "fs";
import * as zlib from "zlib";
import { createCanvas } from "canvas";

const directoryPath = "/Users/dong-ju/Documents/My_code/file_images/files/";
const fileNames = fs.readdirSync(directoryPath);

fileNames.forEach((fileName) => {
    // Ignore .DS_Store
    if (fileName === ".DS_Store") {
        return;
    }

    const filePath = `${directoryPath}/${fileName}`;
    let binaryData: Buffer = fs.readFileSync(filePath);
    const targetSize = 256 * 256 * 3;

    // If the binary data is smaller than the target size, pad it with zeros
    if (binaryData.length < targetSize) {
        const padding = Buffer.alloc(targetSize - binaryData.length);
        binaryData = Buffer.concat([binaryData, padding]);
    } else if (binaryData.length > targetSize) {
        // If the binary data is larger than the target size, compress it and then slice it to the target size
        binaryData = zlib.gzipSync(binaryData);
        binaryData = binaryData.slice(0, targetSize);
    }

    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");

    // Loop through the binary data and set the color of each pixel in the image
    for (let i = 0; i < targetSize; i += 3) {
        const r = binaryData[i];
        const g = binaryData[i + 1];
        const b = binaryData[i + 2];

        // Calculate the x and y coordinates based on the red and green values
        const x = r % 256;
        const y = g % 256;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Construct the output file name and save the image
    const outputFileName = `/Users/dong-ju/Documents/My_code/file_images/images/malicious/${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}.png`;
    const imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputFileName, imageBuffer);

    console.log(`Image saved for file: ${fileName}`);
});
