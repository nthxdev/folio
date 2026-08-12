import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  useAnimations,
} from "@react-three/drei";
import { texture } from "three/tsl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Fox = () => {
  // REGISTER gsap
  gsap.registerPlugin(useGSAP());
  gsap.registerPlugin(ScrollTrigger);

  // give path respective to public folder
  // Vite exposes public folder contents at the website's root URL.

  // load Fox model
  const Fox = useGLTF("/models/dog.drc.glb");
  // reference fox model
  const foxModel = useRef(Fox);

  // useEffect in place of useThree
  useThree(({ camera, scene, gl }) => {
    camera.position.set(0, 0, 0.28);
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  const parentNeck = useRef(null);
  const childNeck = useRef(null);
  const childHead = useRef(null);
  // get fox rig head and neck
  // pass camera as we gonna use it & head , neck variable will be created
  useThree(({ camera }) => {
    Fox.scene.traverse((child) => {
      if (child.name === "DOGSTUDIO_RIGJNT_neck01") {
        // useRef creates a box, .current is what's inside the box. it useRef property for each variable
        parentNeck.current = child;
      } else if (child.name === "DOGSTUDIO_RIGJNT_neck02") {
        childNeck.current = child;
      } else if (child.name === "DOGSTUDIO_RIGJNT_head") {
        childHead.current = child;
      }
    });
  });

  // play all the animation of foxmode(inlcudes fox and branches)
  const { actions } = useAnimations(Fox.animations, Fox.scene);
  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

  useFrame(() => {
    if (childHead.current) {
      childHead.current.rotation.set(
        -0.5, // x
        -0.42, // y
        -1.9, // z
      );
    }
  });

  // texture for fox
  const [normalMap, sampleMatCap] = useTexture([
    "/dog_normals.jpg",
    "/matcap/mat-2.png",
    "/branches_diffuse.jpeg",
    "/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // texture for branches
  const [branchMatMap, brancheNormalMap] = useTexture([
    "/branches_diffuse.jpeg",
    "/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // add fox material on fox
  const FoxMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: sampleMatCap,
  });

  // add branch material on branch
  const branchMaterial = new THREE.MeshMatcapMaterial({
    normalMap: brancheNormalMap,
    matcap: branchMatMap,
  });

  Fox.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = FoxMaterial;
    } else if (child.name.includes("BRANCH")) {
      child.material = branchMaterial;
    }
  });

  useGSAP(() => {
    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-2",
        start: "top top",
        end: "bottom bottom",
        scrub: "true",
      },
    });
    // threejs THREE.set(x,y,z) not supported here as GSAP needs the individual properties because it animates each property separately.
    t1.to(foxModel.current.scene.position, {
      // x: "0",
      y: "+=.08",
      z: "-=.15",
    }).to(foxModel.current.scene.rotation, {
      x: "+=.08",
      y: "+=.06",
      z: "+=0",
    })
  }, []);

  return (
    <>
      <primitive
        object={Fox.scene}
        position={[0.18, -0.59, -0.11]}
        rotation={[-0.15, 0.90, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
      {/* <OrbitControls /> */}
      {/* How to add pan controls */}
    </>
  );
};
export default Fox;
