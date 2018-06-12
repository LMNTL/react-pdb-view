import React from "react";
import { render } from "react-dom";
import PDBContainer from "../lib";
import "./styles.css";

function Demo() {
  return (
    <div>
      <h1>Demo with examples of the component</h1>
      <PDBContainer
        offset={1}
        url="https://s3.us-east-2.amazonaws.com/jsthomas-portfolio/4r70.pdb"
        width="600px"
        height="600px"
      >

      </PDBContainer>
    </div>
  );
}

render(<Demo />, document.getElementById("app"));
