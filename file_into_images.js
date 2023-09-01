"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var zlib = require("zlib");
var canvas_1 = require("canvas");
var directoryPath = "/Users/dong-ju/Documents/My_code/file_images/files/";
var fileNames = fs.readdirSync(directoryPath);
fileNames.forEach(function (fileName) {
    // Ignore .DS_Store
    if (fileName === '.DS_Store') {
        return;
    }
    var filePath = "".concat(directoryPath, "/").concat(fileName);
    var binaryData = fs.readFileSync(filePath);
    var targetSize = 256 * 256 * 3;
    if (binaryData.length < targetSize) {
        var padding = Buffer.alloc(targetSize - binaryData.length);
        binaryData = Buffer.concat([binaryData, padding]);
    }
    else if (binaryData.length > targetSize) {
        binaryData = zlib.gzipSync(binaryData);
        // Optionally, you can then slice the compressed data to fit the target size
        // binaryData = binaryData.slice(0, targetSize);
    }
    var canvas = (0, canvas_1.createCanvas)(256, 256);
    var ctx = canvas.getContext("2d");
    var x = 0, y = 0;
    for (var i = 0; i < targetSize; i += 3) {
        var r = binaryData[i];
        var g = binaryData[i + 1];
        var b = binaryData[i + 2];
        ctx.fillStyle = "rgb(".concat(r, ",").concat(g, ",").concat(b, ")");
        ctx.fillRect(x, y, 1, 1);
        x++;
        if (x >= 256) {
            x = 0;
            y++;
        }
    }
    var outputFileName = "/Users/dong-ju/Documents/My_code/file_images/images/malicious/".concat(fileName
        .split(".")
        .slice(0, -1)
        .join("."), ".png");
    var imageBuffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputFileName, imageBuffer);
    console.log("Image saved for file: ".concat(fileName));
});
