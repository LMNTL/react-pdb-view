# React PDB Viewer

## Props:
Prop | Variable Type | description
------------ | ------------- | ------------- 
`url` | string | URL of a valid .pdb file.
`atomIncrement` | number (integer) | Number of atoms to skip while loading. If `atomIncrement` is 3, . Useful for larger molecules to increase load speed/render fewer polygons.
`atomRadius` | number (float) | Radius of each individual atom (arbitrary radius;)
`width` | string | Width of the PDB Viewer component
`height` | string | Height of the PDB Viewer component
`antialiasing` | boolean | Turn antialiasing on or off
`cameraDistance` | number | The distance of the camera from the origin point