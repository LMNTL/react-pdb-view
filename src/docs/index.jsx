import React from "react";
import { render } from "react-dom";
import PDBView from "../lib";
import "./styles.css";

function Demo() {
  return (
    <div>
      <h1>Demo with examples of the component</h1>
      <PDBView
        className="demo"
        atomIncrement={0}
        url="https://files.rcsb.org/download/6C4G.pdb"
        width="80vh"
        height="80vh"
        atomSize={1.5}
        atomDistance={0.5}
        cameraDistance={50}
        autoRotate={true}
        loader={<div class="loader"/>}
        shader="normal"
      />
    </div>
  );
}

render(<Demo />, document.getElementById("app"));
