import * as fs from "fs";
import * as zlib from 'zlib';
import { createCanvas } from "canvas";

const directoryPath = "/Users/dong-ju/Documents/My_code/file_images/files/";
const fileNames = fs.readdirSync(directoryPath);

fileNames.forEach((fileName) => {
    // Ignore .DS_Store
    if (fileName === '.DS_Store') {
        return;
    }
    const filePath = `${directoryPath}/${fileName}`;
    let binaryData: Buffer = fs.readFileSync(filePath);
    const targetSize = 256 * 256 * 3;

    if (binaryData.length < targetSize) {
        const padding = Buffer.alloc(targetSize - binaryData.length);
        binaryData = Buffer.concat([binaryData, padding]);
    } else if (binaryData.length > targetSize) {
        binaryData = zlib.gzipSync(binaryData);
        // Optionally, you can then slice the compressed data to fit the target size
        binaryData = binaryData.slice(0, targetSize);
    }

    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");
    let x = 0, y = 0;

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

    const outputFileName = `/Users/dong-ju/Documents/My_code/file_images/images/malicious/${fileName
        .split(".")
        .slice(0, -1)
        .join(".")}.png`;
    const imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputFileName, imageBuffer);

    console.log(`Image saved for file: ${fileName}`);
});
