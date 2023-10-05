"use strict";

import * as THREE from "./three.module.js";

import {getHeightmapData} from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {OrbitControls} from "./OrbitControls.js";
import Stats from "./stats.js";

document.getElementById("mode").onclick = () => {
    camera.layers.toggle(0);
    camera.layers.toggle(1);
}

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
});

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 5000);
camera.position.z += 30;
camera.position.x += 30;
camera.position.y += 30;

camera.layers.disable(0);
camera.layers.enable(1);

camera.lookAt(0, 0, 0);

scene.add(camera);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
sun.layers.enable(0);
sun.layers.enable(1);

scene.add(sun);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 0;
controls.maxDistance = 1000;
controls.maxPolarAngle = Math.PI;

const stats = new Stats();
stats.dom.style.position = 'absolute';
stats.dom.style.margin = "5px 5px";
document.body.appendChild(stats.dom);

class TerrainGeometry extends THREE.PlaneGeometry {
    constructor(xSize, ySize, resolutionX, resolutionY, height, image) {
        super(xSize, ySize, resolutionX - 1, resolutionY - 1);

        this.rotateX((Math.PI / 180) * -90);

        const data = getHeightmapData(image, resolutionX, resolutionY);

        for (let i = 0; i < data.length; i++) {
            //this.attributes.position.setY(i, data[i] * height);
        }
    }
}

const resScale = {x: 128, y: 128};
const sizeScale = 10;

const terrainImage = new Image();
terrainImage.onload = () => {

    const size = 128;
    const height = 20;

    const geometry = new TerrainGeometry(
        terrainImage.width / sizeScale, terrainImage.height / sizeScale,
        resScale.x, resScale.y,
        height, terrainImage);

    const grass = new THREE.TextureLoader().load('images/grass.png');
    const rock = new THREE.TextureLoader().load('images/rock.png');
    const alphaMap = new THREE.TextureLoader().load('images/terrain.png');

    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;

    grass.repeat.multiplyScalar(size / 8);

    rock.wrapS = THREE.RepeatWrapping;
    rock.wrapT = THREE.RepeatWrapping;

    rock.repeat.multiplyScalar(size / 8);

    const material = new TextureSplattingMaterial({
        color: THREE.Color.NAMES.white,
        colorMaps: [grass, rock],
        alphaMaps: [alphaMap]
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.layers.set(0);

    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.transparent = true;
    line.material.color = new THREE.Color(0x000000);
    line.layers.set(1);

    scene.add(line);
    scene.add(mesh);
};

terrainImage.src = 'images/terrain.png';

function updateRendererSize() {
    const {x: currentWidth, y: currentHeight} = renderer.getSize(
        new THREE.Vector2()
    );
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;

    if (width !== currentWidth || height !== currentHeight) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

function loop() {
    stats.begin();

    updateRendererSize();
    controls.update();
    renderer.render(scene, camera);

    stats.end();
}

renderer.setAnimationLoop(loop);
