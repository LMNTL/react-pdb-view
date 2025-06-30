import React, { useState, useEffect, useRef } from "react";
import {
  Detector,
    DoubleSide,
      IcosahedronBufferGeometry,
      InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
    PDBLoader,
  PerspectiveCamera,
  RawShaderMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
  OrbitControls,
} from "three-full/builds/Three.es.min.js";
//import {PDBLoader} from './pdbloader';

// Converted from class component to functional component using React Hooks.
// Added support for coloring atoms by element type with customizable colors via 'elementColors' prop.
export default function PDBView(props) {
  // State management (replaces this.state)
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(true);


  // Refs for mutable values and DOM elements (replaces this.* properties)
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const frameIdRef = useRef(null);

  // Default element colors (RGB, 0-1 scale); can be overridden via props
  const defaultColors = {
    C: [0.5, 0.5, 0.5],    // Carbon: Gray
    O: [1.0, 0.0, 0.0],    // Oxygen: Red
    N: [0.0, 0.0, 1.0],    // Nitrogen: Blue
    S: [1.0, 1.0, 0.0],    // Sulfur: Yellow
    H: [1.0, 1.0, 1.0],    // Hydrogen: White
    P: [1.0, 0.5, 0.0],     // Phosphorus
    default: [1.0, 1.0, 1.0],
  };

  // Effect for initialization and cleanup (replaces componentDidMount and componentWillUnmount)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer, scene, camera, controls;
    // Merge default colors with any passed in via props
    let elementColors = props.elementColors ? {...defaultColors, ...props.elementColors} : defaultColors;

    const startRendering = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      scene = new Scene();
      camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      controls = new OrbitControls(camera, mount);
      controls.autoRotate = props.autoRotate;
      controls.enablePan = props.pan;
      renderer = new WebGLRenderer({ antialias: props.antialiasing, alpha: true });
      renderer.shadowMap.enabled = true;
      camera.position.z = props.cameraDistance;
      renderer.autoClear = false;
      renderer.setClearColor(0x000000, 0.0);
      renderer.setSize(width, height);

      // Store in refs
      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      controlsRef.current = controls;

      loadMolecule(props.url);
      window.addEventListener("resize", resizeRenderer);
      mount.appendChild(renderer.domElement);
      start();
    };

    const resizeRenderer = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };

    const start = () => {
      if (!frameIdRef.current) {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };

    const animate = () => {
      renderScene();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    const renderScene = () => {
      if (controlsRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Updated loadMolecule with element-based coloring
    const loadMolecule = (url) => {
      // Updated shaders for color by atom element
      const vertexShader = `
        precision highp float;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        attribute vec2 uv;
        attribute vec3 position;
        attribute vec3 offset;
        attribute vec3 color;      // Per-atom color
        attribute vec3 normal;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vColor;
        varying vec3 vPosition;
      
        void main() {
          vColor = color;          // Pass atom color to fragment shader
          vUv = uv;
          vNormal = normal;
          vPosition = (modelViewMatrix * vec4(offset + position, 1.0)).xyz;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vColor;
        varying vec3 vPosition;
      
        uniform vec3 lightDirection;
        uniform vec3 lightColor;
        uniform vec3 ambientColor;
      
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(lightDirection);
          float diffuseStrength = max(dot(normal, lightDir), 0.0);
          vec3 diffuse = diffuseStrength * lightColor;
          vec3 lighting = ambientColor + diffuse;
          vec3 finalColor = vColor * lighting;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const mat = new RawShaderMaterial({
        uniforms: {
          lightDirection: { value: new Vector3(1, 1, 1).normalize() },
          lightColor: { value: new Float32Array([1, 1, 1])},
          ambientColor: { value: new Float32Array([0.1, 0.1, .1]) }
        },
        vertexShader,
        fragmentShader,
        side: DoubleSide,
        transparent: false,
      });

      const loader = new PDBLoader();
      const offset = new Vector3();
      loader.load(
        url,
        (pdb) => {
          try {
            const geometryAtoms = pdb.geometryAtoms;
            const geometryBonds = pdb.geometryBonds;
            const json = pdb.json;
            const sphereGeometry = new IcosahedronBufferGeometry(1, 2);

            geometryAtoms.computeBoundingBox();
            geometryAtoms.boundingBox.getCenter(offset).negate();
            geometryAtoms.translate(offset.x, offset.y, offset.z);
            geometryBonds.translate(offset.x, offset.y, offset.z);

            const positions = geometryAtoms.getAttribute("position");
            const instances = positions.count;

            const offsets = [];
            const colors = [];  // New: Array for per-atom colors
            let x, y, z;

            // Process atoms and assign colors based on element
            for (let i = 0; i < instances; i += 1 + props.atomIncrement) {
              x = positions.getX(i) * props.atomDistance;
              y = positions.getY(i) * props.atomDistance;
              z = positions.getZ(i) * props.atomDistance;
              offsets.push(x, y, z);

              // Get atom element from PDB data and assign color (customizable via props)
              const atom = json.atoms[i];
              const element = atom ? atom[4] : "Unknown";  // Standard PDB: atom[4] is element symbol
              const color = elementColors?.[element] || elementColors.default;  // If not mapped, use default
              colors.push(...color);  // Add RGB for this atom
            }

              // Set up instanced geometry with color attribute
              const geometry = new InstancedBufferGeometry().copy(sphereGeometry);
              geometry.attributes.position = sphereGeometry.getAttribute("position");
              geometry.attributes.uv = sphereGeometry.getAttribute("uv");
              geometry.attributes.offset = new InstancedBufferAttribute(new Float32Array(offsets), 3);
              geometry.attributes.color = new InstancedBufferAttribute(new Float32Array(colors), 3);  // New: Color attribute

              const mesh = new Mesh(geometry, mat);
              mesh.scale.multiplyScalar(props.atomSize);
              sceneRef.current.add(mesh);

            setLoading(false);
          } catch (error) {
            console.error("Error loading molecule:", error);
            setUseFallback(true);
            setLoading(false);
          }
        },
        () => {},  // Progress callback
        (err) => {
          console.error("Error fetching PDB:", err);
          setUseFallback(true);
          setLoading(false);
        }
      );
    };



    // Main initialization logic
    try {
      if (Detector.webgl) {
        startRendering();
      } else {
        setUseFallback(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Rendering error:", error);
      setUseFallback(true);
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      stop();
      if (mount && renderer?.domElement) {
        mount.removeChild(renderer.domElement);
      }
      if (controls) controls.dispose();
      window.removeEventListener("resize", resizeRenderer);
      // Clean up Three.js resources
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [props]);  // Re-run if props change (e.g., url, autoRotate)

  // Render the component
  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        display: "inline-block",
        margin: 0,
      }}
      className={props.className}
      ref={mountRef}
    >
      {loading ? props.loader : null}
      {useFallback ? props.fallback : null}
    </div>
  );
}

PDBView.defaultProps = {
  atomIncrement: 0,
  atomSize: 1,
  atomDistance: 0.5,
  width: "400px",
  height: "400px",
  cameraDistance: 150,
  autoRotate: true,
  pan: true,
  loader: null,
  fallback: null,
  elementColors: null,
};