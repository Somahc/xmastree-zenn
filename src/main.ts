import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x111111);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
};

let particles: {
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
    points: THREE.Points | null;
} | null = null;

const loader = new GLTFLoader();

loader.load("src/models/xmastree.glb", (gltf) => {
    console.log(
        (gltf.scene.children[0] as THREE.Mesh).geometry.attributes.position
    );

    const position = (gltf.scene.children[0] as THREE.Mesh).geometry.attributes
        .position;

    const treePosition = new THREE.BufferAttribute(position.array, 3);

    console.log(treePosition);

    particles = {
        geometry: new THREE.BufferGeometry(),
        material: new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uSize: new THREE.Uniform(0.25),
                uResolution: new THREE.Uniform(
                    new THREE.Vector2(
                        sizes.width * sizes.pixelRatio,
                        sizes.height * sizes.pixelRatio
                    )
                ),
            },
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        }),
        points: null,
    };

    // Geometry
    particles.geometry = new THREE.BufferGeometry();
    particles.geometry.setAttribute("position", treePosition);

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material);
    scene.add(particles.points);
});

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(0, 0, 8 * 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const tick = () => {
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
