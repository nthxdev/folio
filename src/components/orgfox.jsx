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
  const Fox = useGLTF("/fox/models/fox.drc.glb");
  // reference fox model

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

  // texture for fox
  const [normalMap, sampleMatCap] = useTexture([
  "/fox/images/fox_normals.jpg",
  "/matcap/mat-2.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // texture for branches
  const [branchMatMap, brancheNormalMap] = useTexture([
  "/fox/images/branches_diffuse.jpeg",
  "/fox/images/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture([
    "/matcap/mat-1.png",
    "/matcap/mat-2.png",
    "/matcap/mat-3.png",
    "/matcap/mat-4.png",
    "/matcap/mat-5.png",
    "/matcap/mat-6.png",
    "/matcap/mat-7.png",
    "/matcap/mat-8.png",
    "/matcap/mat-9.png",
    "/matcap/mat-10.png",
    "/matcap/mat-11.png",
    "/matcap/mat-12.png",
    "/matcap/mat-13.png",
    "/matcap/mat-14.png",
    "/matcap/mat-15.png",
    "/matcap/mat-16.png",
    "/matcap/mat-17.png",
    "/matcap/mat-18.png",
    "/matcap/mat-19.png",
    "/matcap/mat-20.png",
  ]).map((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const material = useRef({
    uMatcap1: { value: mat19 },
    uMatcap2: { value: mat2 },
    uProgress: { value: 1.0 },
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

  function onBeforeCompile(shader) {
    shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
    shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
    shader.uniforms.uProgress = material.current.uProgress;

    // Store reference to shader uniforms for GSAP animation

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",
      `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `,
    );
  }

  FoxMaterial.onBeforeCompile = onBeforeCompile;

  const foxModel = useRef(Fox);

  Fox.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = FoxMaterial;
    } else if (child.name.includes("BRANCH")) {
      child.material = branchMaterial;
    }
  });

  useFrame(() => {
    if (parentNeck.current && childNeck && childHead.current) {
      childHead.current.rotation.x -= 0.3647;
      childHead.current.rotation.y += 0.0148;
      childHead.current.rotation.z -= 0.1586;
    }
  });

  useGSAP(() => {
    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-3",
        start: "top top",
        end: "bottom bottom",
        scrub: "true",
      },
    });
    // threejs THREE.set(x,y,z) not supported here as GSAP needs the individual properties because it animates each property separately.
    t1.to(
      foxModel.current.scene.position,
      {
        x: "+=0",
        y: "+=.1",
        z: "-=.75",
      },
      "first",
    )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `+=${Math.PI / 9}`,
          y: `+=${Math.PI / 9}`,
          z: "-=.034",
        },
        "first",
      )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `+=${Math.PI / 12}`,
          y: `-=${Math.PI / 9}`,
          z: "-=.034",
        },
        "two",
      )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `-=${Math.PI / 25}`,
          y: `-=${Math.PI * 1.02}`,
        },
        "three",
      )

      .to(
        foxModel.current.scene.position,
        {
          x: "-=0.53",
          y: "-=0.02",
          z: "+=.4",
        },
        "three",
      );
  }, []);

  useEffect(() => {
    const crossfadeTo = (newTex) => {
      gsap.killTweensOf(material.current.uProgress);
      material.current.uMatcap2.value = material.current.uMatcap1.value;
      material.current.uMatcap1.value = newTex;
      material.current.uProgress.value = 1.0;
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        overwrite: "auto",
      });
    };

    const hoverMap = {
      tomorrowland: mat19,
      "navy-pier": mat8,
      "msi-chicago": mat9,
      phone: mat12,
      kikk: mat10,
      kennedy: mat8,
      opera: mat13,
    };

    const mainEl = document.querySelector("main");
    const imageEls = Object.keys(hoverMap).reduce((acc, key) => {
      acc[key] = document.getElementById(key);
      return acc;
    }, {});

    const activeKey = { current: null };
    const setActive = (key) => {
      if (key === activeKey.current) return; // no-op if nothing changed
      activeKey.current = key;
      crossfadeTo(key ? hoverMap[key] : mat2);
      if (mainEl) mainEl.dataset.hovering = key ? "true" : "false";
      Object.entries(imageEls).forEach(([k, el]) => {
        if (el) el.style.opacity = k === key ? "1" : "0";
      });
    };

    // --- normal hover path (mouse actually moving) ---
    const titlesEl = document.querySelector(`.titles`);
    const enterHandlers = [];
    Object.keys(hoverMap).forEach((key) => {
      const el = document.querySelector(`.title[img-title="${key}"]`);
      if (!el) return;
      const handler = () => setActive(key);
      el.addEventListener("mouseenter", handler);
      enterHandlers.push([el, handler]);
    });
    const leaveHandler = () => setActive(null);
    titlesEl?.addEventListener("mouseleave", leaveHandler);

    // --- fast-scroll fallback ---
    // mouseenter/mouseleave don't reliably fire when content moves under a
    // stationary cursor, so re-check what's under the pointer on scroll too
    const mousePos = { x: -1, y: -1 };
    const trackMouse = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener("mousemove", trackMouse);

    let rafId = null;
    const revalidateOnScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (mousePos.x < 0) return;
        const el = document.elementFromPoint(mousePos.x, mousePos.y);
        const titleEl = el?.closest(".title[img-title]");
        setActive(titleEl?.getAttribute("img-title") ?? null);
      });
    };
    window.addEventListener("scroll", revalidateOnScroll, { passive: true });

    return () => {
      enterHandlers.forEach(([el, handler]) =>
        el.removeEventListener("mouseenter", handler),
      );
      titlesEl?.removeEventListener("mouseleave", leaveHandler);
      window.removeEventListener("mousemove", trackMouse);
      window.removeEventListener("scroll", revalidateOnScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <primitive
        object={Fox.scene}
        position={[0.2, -0.58, -0.095]}
        rotation={[-0.19, 0.9, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
      {/* <OrbitControls /> */}
      {/* How to add pan controls */}
    </>
  );
};
export default Fox;import React, { useEffect, useRef } from "react";
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
  const Fox = useGLTF("/fox/models/fox.drc.glb");
  // reference fox model

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

  // texture for fox
  const [normalMap, sampleMatCap] = useTexture([
  "/fox/images/fox_normals.jpg",
  "/matcap/mat-2.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // texture for branches
  const [branchMatMap, brancheNormalMap] = useTexture([
  "/fox/images/branches_diffuse.jpeg",
  "/fox/images/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture([
    "/matcap/mat-1.png",
    "/matcap/mat-2.png",
    "/matcap/mat-3.png",
    "/matcap/mat-4.png",
    "/matcap/mat-5.png",
    "/matcap/mat-6.png",
    "/matcap/mat-7.png",
    "/matcap/mat-8.png",
    "/matcap/mat-9.png",
    "/matcap/mat-10.png",
    "/matcap/mat-11.png",
    "/matcap/mat-12.png",
    "/matcap/mat-13.png",
    "/matcap/mat-14.png",
    "/matcap/mat-15.png",
    "/matcap/mat-16.png",
    "/matcap/mat-17.png",
    "/matcap/mat-18.png",
    "/matcap/mat-19.png",
    "/matcap/mat-20.png",
  ]).map((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const material = useRef({
    uMatcap1: { value: mat19 },
    uMatcap2: { value: mat2 },
    uProgress: { value: 1.0 },
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

  function onBeforeCompile(shader) {
    shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
    shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
    shader.uniforms.uProgress = material.current.uProgress;

    // Store reference to shader uniforms for GSAP animation

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",
      `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `,
    );
  }

  FoxMaterial.onBeforeCompile = onBeforeCompile;

  const foxModel = useRef(Fox);

  Fox.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = FoxMaterial;
    } else if (child.name.includes("BRANCH")) {
      child.material = branchMaterial;
    }
  });

  useFrame(() => {
    if (parentNeck.current && childNeck && childHead.current) {
      childHead.current.rotation.x -= 0.3647;
      childHead.current.rotation.y += 0.0148;
      childHead.current.rotation.z -= 0.1586;
    }
  });

  useGSAP(() => {
    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-3",
        start: "top top",
        end: "bottom bottom",
        scrub: "true",
      },
    });
    // threejs THREE.set(x,y,z) not supported here as GSAP needs the individual properties because it animates each property separately.
    t1.to(
      foxModel.current.scene.position,
      {
        x: "+=0",
        y: "+=.1",
        z: "-=.75",
      },
      "first",
    )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `+=${Math.PI / 9}`,
          y: `+=${Math.PI / 9}`,
          z: "-=.034",
        },
        "first",
      )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `+=${Math.PI / 12}`,
          y: `-=${Math.PI / 9}`,
          z: "-=.034",
        },
        "two",
      )
      .to(
        foxModel.current.scene.rotation,
        {
          x: `-=${Math.PI / 25}`,
          y: `-=${Math.PI * 1.02}`,
        },
        "three",
      )

      .to(
        foxModel.current.scene.position,
        {
          x: "-=0.53",
          y: "-=0.02",
          z: "+=.4",
        },
        "three",
      );
  }, []);

  useEffect(() => {
    const crossfadeTo = (newTex) => {
      gsap.killTweensOf(material.current.uProgress);
      material.current.uMatcap2.value = material.current.uMatcap1.value;
      material.current.uMatcap1.value = newTex;
      material.current.uProgress.value = 1.0;
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        overwrite: "auto",
      });
    };

    const hoverMap = {
      tomorrowland: mat19,
      "navy-pier": mat8,
      "msi-chicago": mat9,
      phone: mat12,
      kikk: mat10,
      kennedy: mat8,
      opera: mat13,
    };

    const mainEl = document.querySelector("main");
    const imageEls = Object.keys(hoverMap).reduce((acc, key) => {
      acc[key] = document.getElementById(key);
      return acc;
    }, {});

    const activeKey = { current: null };
    const setActive = (key) => {
      if (key === activeKey.current) return; // no-op if nothing changed
      activeKey.current = key;
      crossfadeTo(key ? hoverMap[key] : mat2);
      if (mainEl) mainEl.dataset.hovering = key ? "true" : "false";
      Object.entries(imageEls).forEach(([k, el]) => {
        if (el) el.style.opacity = k === key ? "1" : "0";
      });
    };

    // --- normal hover path (mouse actually moving) ---
    const titlesEl = document.querySelector(`.titles`);
    const enterHandlers = [];
    Object.keys(hoverMap).forEach((key) => {
      const el = document.querySelector(`.title[img-title="${key}"]`);
      if (!el) return;
      const handler = () => setActive(key);
      el.addEventListener("mouseenter", handler);
      enterHandlers.push([el, handler]);
    });
    const leaveHandler = () => setActive(null);
    titlesEl?.addEventListener("mouseleave", leaveHandler);

    // --- fast-scroll fallback ---
    // mouseenter/mouseleave don't reliably fire when content moves under a
    // stationary cursor, so re-check what's under the pointer on scroll too
    const mousePos = { x: -1, y: -1 };
    const trackMouse = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener("mousemove", trackMouse);

    let rafId = null;
    const revalidateOnScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (mousePos.x < 0) return;
        const el = document.elementFromPoint(mousePos.x, mousePos.y);
        const titleEl = el?.closest(".title[img-title]");
        setActive(titleEl?.getAttribute("img-title") ?? null);
      });
    };
    window.addEventListener("scroll", revalidateOnScroll, { passive: true });

    return () => {
      enterHandlers.forEach(([el, handler]) =>
        el.removeEventListener("mouseenter", handler),
      );
      titlesEl?.removeEventListener("mouseleave", leaveHandler);
      window.removeEventListener("mousemove", trackMouse);
      window.removeEventListener("scroll", revalidateOnScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <primitive
        object={Fox.scene}
        position={[0.2, -0.58, -0.095]}
        rotation={[-0.19, 0.9, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
      {/* <OrbitControls /> */}
      {/* How to add pan controls */}
    </>
  );
};
export default Fox;