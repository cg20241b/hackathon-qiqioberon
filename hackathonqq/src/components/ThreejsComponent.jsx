import { useEffect, useRef } from 'react';
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
        directionalLight.position.set(0, 0, 5); // Dari depan (di sepanjang sumbu z positif)
        directionalLight.target.position.set(0, 0, 0); // Arahkan ke pusat scene
        scene.add(directionalLight);
        scene.add(directionalLight.target); // Tambahkan target ke scene


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

            // // Material untuk teks
            // const letterMaterial = new THREE.MeshStandardMaterial({ color: 0x82b2fd }); // Biru muda dari tugas 1
            // const digitMaterial = new THREE.MeshStandardMaterial({ color: 0xFDCD82 }); // Oranye (contoh)

            const letterMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    ambientIntensity: { value: 0.358 }, // Ambient Intensity (nrp = 158) + 200 = 358
                    lightPosition: { value: new THREE.Vector3(0, 0, 0) }, // Cube's position
                    viewPosition: { value: new THREE.Vector3() },
                    baseColor: { value: new THREE.Color('#82b2fd') }, // Alphabet Base Color
                },
                vertexShader: `
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = vec3(modelMatrix * vec4(position, 1.0));
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 baseColor;
                    uniform float ambientIntensity;
                    uniform vec3 lightPosition;
                    uniform vec3 viewPosition;
            
                    varying vec3 vNormal;
                    varying vec3 vPosition;
            
                    void main() {
                        // Ambient
                        vec3 ambient = baseColor * ambientIntensity;
            
                        // Diffuse
                        vec3 lightDir = normalize(lightPosition - vPosition);
                        float diff = max(dot(vNormal, lightDir), 0.0);
                        vec3 diffuse = baseColor * diff;
            
                        // Specular (Plastic)
                        vec3 viewDir = normalize(viewPosition - vPosition);
                        vec3 halfwayDir = normalize(lightDir + viewDir);
                        float spec = pow(max(dot(vNormal, halfwayDir), 0.0), 32.0); // Moderate shininess
                        vec3 specular = vec3(0.8) * spec; // Light grey specular
            
                        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                    }
                `,
            });


            const digitMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    ambientIntensity: { value: 0.358 }, // Ambient Intensity (nrp = 158) + 200 = 358
                    lightPosition: { value: new THREE.Vector3(0, 0, 0) }, // Cube's position
                    viewPosition: { value: new THREE.Vector3() },
                    baseColor: { value: new THREE.Color('#FDCD82') }, // Digit Base Color
                },
                vertexShader: `
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = vec3(modelMatrix * vec4(position, 1.0));
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 baseColor;
                    uniform float ambientIntensity;
                    uniform vec3 lightPosition;
                    uniform vec3 viewPosition;
            
                    varying vec3 vNormal;
                    varying vec3 vPosition;
            
                    void main() {
                        // Ambient
                        vec3 ambient = baseColor * ambientIntensity;
            
                        // Diffuse
                        vec3 lightDir = normalize(lightPosition - vPosition);
                        float diff = max(dot(vNormal, lightDir), 0.0);
                        vec3 diffuse = baseColor * diff;
            
                        // Specular (Metallic)
                        vec3 viewDir = normalize(viewPosition - vPosition);
                        vec3 reflectDir = reflect(-lightDir, vNormal);
                        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0); // Higher shininess
                        vec3 specular = baseColor * spec; // Specular reflects base color
            
                        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                    }
                `,
            });



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

        // Tambahkan kubus bercahaya di tengah
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        // ShaderMaterial untuk emisi cahaya
        const cubeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                uniform vec3 glowColor;
                void main() {
                    float intensity = pow(1.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor * intensity, 1.0);
                }
            `,
            transparent: true,
        });

        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.position.set(0, 0, 0);
        scene.add(cubeMesh);

        // PointLight sebagai sumber cahaya
        const pointLight = new THREE.PointLight(0xffffff, 30, 20);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);


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
