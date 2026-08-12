import { useState } from "react";
import "./App.css";
import Fox from "./components/Fox";
import { Canvas } from "@react-three/fiber";


function App() {
  return (
    <>
      <main>
        <Canvas
          style={{
            height: "100vh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundImage: "url(/background-l.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <Fox />
        </Canvas>
        <section id="section-1"></section>
        <section id="section-2"></section>
        <section id="section-3"></section>
      </main>
    </>
  );
}

export default App;
