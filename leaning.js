const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs-node");
const PNG = require("pngjs").PNG;

// Step 1: Data Preparation
async function loadImagesFromDirectory(directoryPath) {
    const imagePaths = fs
        .readdirSync(directoryPath)
        .filter((fileName) => fileName.endsWith(".png"));
    const images = [];

    for (const imgPath of imagePaths) {
        try {
            const fullPath = path.join(directoryPath, imgPath);
            const buffer = fs.readFileSync(fullPath);
            const png = PNG.sync.read(buffer);
            const pixels = new Uint8Array(png.width * png.height * 4); // Make sure this line is inside the try block
            for (let y = 0; y < png.height; y++) {
                for (let x = 0; x < png.width; x++) {
                    const idx = (png.width * y + x) << 2;
                    pixels[idx] = png.data[idx];
                    pixels[idx + 1] = png.data[idx + 1];
                    pixels[idx + 2] = png.data[idx + 2];
                    pixels[idx + 3] = png.data[idx + 3];
                }
            }
            images.push(tf.tensor3d(pixels, [png.height, png.width, 4]));
        } catch (err) {
            console.error(`Error reading file ${imgPath}: ${err.message}`);
        }
    }

    return images;
}

(async () => {
    const images = await loadImagesFromDirectory(
        "/Users/dong-ju/Documents/My_code/file_images/images/malicious/"
    );
    const labels = tf.oneHot(
        tf.tensor1d(Array(images.length).fill(1), "int32"),
        2
    ); // "malicious" is 1
    if (images.length === 0) {
        console.error("No valid images found.");
        return;
    }
    // Step 2: Data Preprocessing
    const normalizedImages = images.map((image) => image.div(tf.scalar(255.0)));

    // Step 3: Model Architecture
    const model = tf.sequential();
    model.add(
        tf.layers.conv2d({
            inputShape: [256, 256, 4],
            filters: 32,
            kernelSize: 3,
            activation: "relu",
        })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

    // Step 4: Model Compilation
    model.compile({
        optimizer: "adam",
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    // Step 5: Model Training
    const xs = tf.stack(normalizedImages);
    const ys = labels;

    await model.fit(xs, ys, {
        epochs: 10,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(
                    `Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc}`
                );
            },
        },
    });

    // Step 6: Evaluation
    const evaluation = model.evaluate(xs, ys);
    console.log(
        `Final loss: ${evaluation[0].dataSync()}, final accuracy: ${evaluation[1].dataSync()}`
    );
})();
