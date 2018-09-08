# React PDB View

## What is it?

A simple React component for displaying molecular orbital models from Protein Databank (.pdb) files. Uses [three-full](https://github.com/Itee/three-full) and the PDBLoader class from the Three.js examples to load and display models in a WebGL context. Take a look at the demo [here](https://lmntl.github.io/react-pdb-view/).

## How to use it

If you're in a hurry, the only required prop is `url`.

`<PDBView>` is used as such:

`   <PDBView`  

`        url="https://files.rcsb.org/download/6C4G.pdb"  `

`        atomIncrement={0}  `

`        width="60vw"  `

`        height="60vh"  `

`        atomSize={200}  `

`        cameraDistance={100}  `

`        autoRotate={false}  `

`      />`

## Props:
Prop | Variable Type | description | Default Value
------------ | ------------- | ------------- | -------------
`url` | string | URL of a valid .pdb file. | Required
`atomIncrement` | number (integer) | Number of atoms to skip while loading. If `atomIncrement` is 3, the viewer will only load and display every 4th atom from the source file. Tweak for speed. | `0`
`atomSize` | number (float) | Corresponds to the radius of each individual atom | `1`
`atomDistance` | number (float) | Distance between atoms in the model | `0.5`
`width` | string | Width of the PDB Viewer component. Accepts relative or absolute units. | `400px`
`height` | string | Height of the PDB Viewer component. Accepts relative or absolute units. | `400px`
`antialiasing` | boolean | Enable/disable antialiasing | `false`
`cameraDistance` | number | The distance of the camera from the origin point | `150`
`autoRotate` | boolean | Should the camera automatically rotate around the molecule? | `true`
`pan` | boolean | Allow panning when right-click dragging? | `true`
`loader` | JSX element | Element to display while loading, e.g. a CSS spinner. | null
`fallback` | JSX element | Element displayed in case the component fails to load or errors during operation | null

## Todos:
- Add additional shader options
- Add keyboard controls for rotation/zooming to OrbitControls
- Accessibility audit (probably add a colorblind mode too)
- Caching .pdb files
- Ribbon diagrams (secondary/tertiary structure)
