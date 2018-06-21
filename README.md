# React PDB Viewer

## How to use it

If you're in a hurry, the only required prop is `url`.

`<PDBView>` is used as such:
`   <PDBView
        url="https://files.rcsb.org/download/6C4G.pdb"
        atomIncrement={0}
        width="600px"
        height="600px"
        atomSize={200}
        cameraDistance={100}
        autoRotate={false}
      />`

## Props:
Prop | Variable Type | description | Default Value
------------ | ------------- | ------------- | -------------
`url` | string | URL of a valid .pdb file. | Required
`atomIncrement` | number (integer) | Number of atoms to skip while loading. If `atomIncrement` is 3, the viewer will only load and display every 4th atom from the source file. Tweak for speed. | `0`
`atomSize` | number (float) | Corresponds to the radius of each individual atom | `300`
`width` | string | Width of the PDB Viewer component | `40vw`
`height` | string | Height of the PDB Viewer component | `40vh`
`antialiasing` | boolean | Enable/disable antialiasing | `false`
`cameraDistance` | number | The distance of the camera from the origin point | `150`
`autorotate` | boolean | Should the camera automatically rotate around the molecule? | `true`
`pan` | boolean | Allow panning