import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Inisialisasi scene, kamera, dan renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        // Atur ukuran renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Tambahkan ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Tambahkan directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        // Load font dan buat teks
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            // Buat TextGeometry untuk huruf
            const letterGeometry = new TextGeometry('i', {
                font,
                size: 1,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelSegments: 5,
            });

            const digitGeometry = new TextGeometry('8', {
                font,
                size: 1,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelSegments: 5,
            });

            // Material untuk teks
            const letterMaterial = new THREE.MeshStandardMaterial({ color: 0x1e90ff }); // Biru (contoh)
            const digitMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 }); // Oranye (contoh)

            // Mesh untuk huruf dan digit
            const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
            const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);

            // Atur posisi
            letterMesh.position.set(-2, 0, 0); // Huruf di kiri
            digitMesh.position.set(2, 0, 0);   // Digit di kanan

            // Tambahkan ke scene
            scene.add(letterMesh);
            scene.add(digitMesh);
        });

        // Posisi kamera
        camera.position.z = 5;

        // Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;

        // Animasi
        const animate = () => {
            controls.update(); // Update OrbitControls
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Cleanup saat komponen di-unmount
        return () => {
            controls.dispose(); // Lepaskan OrbitControls
            renderer.dispose(); // Hapus renderer
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', margin: 0 }} />;
};

export default ThreeScene;
