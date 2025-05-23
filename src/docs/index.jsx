import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import PDBView from "../lib";
import "./styles.css";


class Demo extends Component {
  constructor(props){
    super(props);
    this.state = {
      urlinput: '',
      url: "https://files.rcsb.org/download/6C4G.pdb",
      key: 0
    }
  }

  changeURL = event => {
    this.setState({ urlinput: event.target.value });
  }

  submit = event => {
    event.preventDefault();
    this.setState({
      url: this.state.urlinput,
      key: (this.state.key + 1) % 30
    });
  }

  render(){
    return (
      <div className="demo">
        <h1 className="title bg">React PDB View - Demo.</h1>
        <h2 className="instructions bg">Click and drag to rotate.{'\n'}
        Right click drag or use the keyboard to pan the molecule.{'\n'}
        Use the scroll wheel to zoom in/out.
        </h2>
        <form className="changeURL bg" onSubmit={this.submit}>
          <h2>Enter the url of a .pdb file to load:</h2>
          <input type="text" className="urlInput" onChange={this.changeURL} placeholder={this.state.url}/>
          <input type="submit" name="Load"/>
        </form>
        <PDBView
          className="pdb"
          url={this.state.url}
          key={this.state.key}
          antialiasing={true}
          width="100%"
          height="100%"
          atomSize={1.5}
          atomDistance={0.5}
          cameraDistance={50}
          loader={<div class="loader"/>}
          fallback={<h1 class="fallback bg">Couldn't load PDBView component! You can pass a custom element to display at awkward moments like these using the "fallback" prop, e.g. an image of the component.</h1>}
        />
      </div>
    );
  }
}

createRoot(document.getElementById("app")).render(<Demo />);
