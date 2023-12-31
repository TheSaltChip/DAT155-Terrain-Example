"use strict";

/**
 * Loads heightmap data from an image.
 * The image should be loaded before using this method.
 * @param  {HTMLImageElement} image Image to load.
 * @param sizeX : number
 * @param sizeY : number
 * @return {Float32Array} A Float32Array containing the heightmap data.
 *
 * Example 4x4 image:
 * 00 05 17 00
 * 02 03 54 00
 * 09 00 79 00
 * 08 00 23 00
 *
 * Output (rounded):
 * [0.0, 0.02, 0.07, 0.0, 0.01, 0.01, 0.21, 0.0, 0.04, 0.0, 0.31, 0.0, 0.03, 0.0, 0.09, 0.0]
 */
export function getHeightmapData(image, sizeX, sizeY) {
    const canvas = document.createElement("canvas");

    canvas.width = sizeX;
    canvas.height = sizeY;

    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(image, 0, 0, sizeX, sizeY);

    const imageData = context.getImageData(0, 0, sizeX, sizeY).data;

    const data = new Float32Array(sizeX * sizeY);
    for (let i = 0; i < imageData.length; i += 4) {
        data[i / 4] = imageData[i] / 255;
    }

    return data;
}
