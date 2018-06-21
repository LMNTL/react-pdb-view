import React, { Component } from "react";
import {
  BoxBufferGeometry,
  BufferAttribute,
  Detector,
  DoubleSide,
  Group,
  IcosahedronBufferGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
  MeshPhongMaterial,
  MeshNormalMaterial,
  OrbitControls,
  PerspectiveCamera,
  PDBLoader,
  RawShaderMaterial,
  Scene,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "../../node_modules/three-full/builds/Three.es.min.js";


export default class PDBView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      useFallback: false,
      loading: true,
      gui: false
    };
    this.rotating = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.left = new Vector3(1, 0, 0);
    this.up = new Vector3(0, 1, 0);
  }

  componentDidMount() {
    if (Detector.webgl) {
      this.startRendering();
    } else {
      this.setState({ useFallback: true });
    }
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
    this.controls.dispose();
    window.removeEventListener("resize", this.resizeRenderer);
  }

  componentDidCatch( error, info ) {
    this.setState({ useFallback: true });
  }

  startRendering = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    const controls = new OrbitControls( camera, this.mount );
    controls.autoRotate = this.props.autoRotate;
    const renderer = new WebGLRenderer({
      antialias: this.props.antialiasing,
      alpha: true
    });
    renderer.shadowMapEnabled = true;
    camera.position.z = this.props.cameraDistance;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setSize(width, height);

    this.controls = controls;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.loadMolecule(this.props.url);
    window.addEventListener("resize", this.resizeRenderer);
    this.mount.appendChild(this.renderer.domElement);
    this.start();
    this.setState({ loading: false });
  };

  resizeRenderer = event => {
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  loadMolecule = url => {
    const scope = this;
    let root = new Group();
    this.root = root;
    root.scale.set(0.02, 0.02, 0.02);
    this.scene.add(root);
    while (root.children.length > 0) {
      let object = root.children[0];
      object.parent.remove(object);
    }

    const vertexShader = [
      "precision highp float;",

      "uniform mat4 modelViewMatrix;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 normalMatrix;",
      "attribute vec2 uv;",
      "attribute vec3 position;",
      "attribute vec3 offset;",
      "attribute vec3 normal;",
      "varying vec2 vUv;",
      "varying vec3 vNormal;",
      "varying vec3 vPosition;",

      "void main() {",

        "vNormal = normal;",
        "vPosition = position;",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + position, 1.0 );",
      "}",
    ].join("\n");

    const fragmentShader = [
      "precision highp float;",
      "varying vec3 vNormal;",
      "varying vec2 vUv;",
      "varying vec3 vPosition;",
      "uniform vec3 cameraPosition;",
      "void main() {",
      "",
      " gl_FragColor = vec4(vNormal, 1.0);",
      "",
      "}"
    ].join("\n");

    const mat = new RawShaderMaterial({
      uniforms: {},
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: DoubleSide,
      transparent: true
    });

    const loader = new PDBLoader();
    let offset = new Vector3();
    loader.load(url, function(pdb) {
      try {
        let geometryAtoms = pdb.geometryAtoms;
        const geometryBonds = pdb.geometryBonds;
        const json = pdb.json;
        const sphereGeometry = new IcosahedronBufferGeometry( 1, 2 );

        geometryAtoms.computeBoundingBox();
        geometryAtoms.boundingBox.getCenter( offset ).negate();
        geometryAtoms.translate(offset.x, offset.y, offset.z);
        geometryBonds.translate(offset.x, offset.y, offset.z);
        let positions = geometryAtoms.getAttribute("position");
        const instances = positions.count;
        const material = new MeshNormalMaterial();
        let position = new Vector4();
        let orientation = new Vector4();

        const offsets = [];
        const colors = [];
        const orientations = [];
        let [x, y, z] = [0, 0, 0];


        let geometry = new InstancedBufferGeometry().copy(sphereGeometry);
        geometry.attributes.position = sphereGeometry.attributes.position;
        geometry.attributes.offset = positions;
        geometry.attributes.uv = sphereGeometry.attributes.uv;
        geometry.computeBoundingBox();
        for (let i = 0; i < instances; i += 1 + scope.props.atomIncrement) {
          x = positions.getX(i) * scope.props.atomDistance;
          y = positions.getY(i) * scope.props.atomDistance;
          z = positions.getZ(i) * scope.props.atomDistance;
          offsets.push( x, y, z );
        }
        geometry.addAttribute( 'offset', new InstancedBufferAttribute( new Float32Array( offsets ), 3) );
        const mesh = new Mesh( geometry, mat );
        mesh.scale.multiplyScalar(scope.props.atomSize);
        scope.scene.add(mesh);
      } catch (error) {
        console.log(error);
        scope.setState({ useFallback: true, loading: false });
      }
    });
  };

  render() {
    return (
      <div
        style={{
          width: this.props.width,
          height: this.props.height,
          display: "inline-block",
          margin: 0
        }}
        className={this.props.className}
        ref={mount => {
          this.mount = mount;
        }}
      >
        {this.state.loading && !this.state.useFallback ? (
          this.props.loader
        ) : null }

        {this.state.useFallback ? <img src="./pdbfallback.jpg" /> : null}
      </div>
    );
  }
}

PDBView.defaultProps = {
  atomIncrement: 0,
  atomSize: 300,
  atomDistance: 75,
  width: '40vw',
  height: '40vh',
  cameraDistance: 150,
};