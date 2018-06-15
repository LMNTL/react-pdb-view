import React, { Component } from "react";
import {
  BoxBufferGeometry,
  Detector,
  Group,
  IcosahedronBufferGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttributes,
  Mesh,
  MeshPhongMaterial,
  MeshNormalMaterial,
  OrbitControls,
  PerspectiveCamera,
  PDBLoader,
  Scene,
  Vector3,
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
    const loader = new PDBLoader();
    let offset = new Vector3();
    loader.load(url, function(pdb) {
      try {
        let geometryAtoms = pdb.geometryAtoms;
        const geometryBonds = pdb.geometryBonds;
        const json = pdb.json;
        const sphereGeometry = new IcosahedronBufferGeometry(1, 2);
        geometryAtoms.computeBoundingBox();
        geometryAtoms.boundingBox.getCenter(offset).negate();
        geometryAtoms.translate(offset.x, offset.y, offset.z);
        geometryBonds.translate(offset.x, offset.y, offset.z);
        let positions = geometryAtoms.getAttribute("position");
        let colors = geometryAtoms.getAttribute("color");
        const material = new MeshNormalMaterial();
        let position = new Vector3();
        const offsets = [];
        let geometry = new InstancedBufferGeometry();
        geometry.maxInstancedCount = positions.count;
        for (let i = 0; i < positions.count; i += 1 + scope.props.atomIncrement) {
          position.x = positions.getX(i);
          position.y = positions.getY(i);
          position.z = positions.getZ(i);
          offsets.push(position);
          const object = new Mesh(sphereGeometry, material);
          object.position.copy(position);
          object.position.multiplyScalar(75);
          object.scale.multiplyScalar(scope.props.atomSize);
          root.add(object);
        }
        positions = geometryBonds.getAttribute("position");
        let start = new Vector3();
        let end = new Vector3();
        for (
          let i = 0;
          i < positions.count;
          i += 1 + scope.props.atomIncrement
        ) {
          start.x = positions.getX(i);
          start.y = positions.getY(i);
          start.z = positions.getZ(i);
          end.x = positions.getX(i + 1);
          end.y = positions.getY(i + 1);
          end.z = positions.getZ(i + 1);
          start.multiplyScalar(75);
          end.multiplyScalar(75);
          const object = new Mesh(sphereGeometry, new MeshPhongMaterial(0xffffff));
          object.position.copy(start);
          object.position.lerp(end, 0.5);
          object.scale.set(5, 5, start.distanceTo(end));
          object.lookAt(end);
          root.add(object);
        }
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
        className="threecanvas"
        ref={mount => {
          this.mount = mount;
        }}
      >
        {this.state.loading && !this.state.useFallback ? (
          <div className="loader" />
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