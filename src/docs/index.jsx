import React from "react";
import { render } from "react-dom";
import PDBView from "../lib";
import "./styles.css";

function Demo() {
  return (
    <div>
      <h1>Demo with examples of the component</h1>
      <PDBView
        atomIncrement={2}
        url="https://files.rcsb.org/download/6C4G.pdb"
        width="600px"
        height="600px"
        atomSize={200}
        atomDistance={75}
        cameraDistance={150}
        autoRotate={false}
      />
    </div>
  );
}

render(<Demo />, document.getElementById("app"));
