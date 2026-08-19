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
import { Environment } from "@react-three/drei";

const Fox = () => {
  // REGISTER gsap
  gsap.registerPlugin(useGSAP());
  gsap.registerPlugin(ScrollTrigger);

  // give path respective to public folder
  // Vite exposes public folder contents at the website's root URL.

  // load Fox model
  const Fox = useGLTF("/fox/models/fox.drc.glb");
  // reference fox model

  useThree(({ camera, scene, gl }) => {
    camera.position.set(0, 0, 0.28);
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  const parentNeck = useRef(null);
  const childNeck = useRef(null);
  const childHead = useRef(null);
  const chestBone = useRef(null);
  const branchGroup1 = useRef(null);
  const branchGroup2 = useRef(null);
  const camGroup = useRef(null);
  const camAim = useRef(null);

  useThree(({ camera }) => {
    Fox.scene.traverse((child) => {
      if (child.name === "DOGSTUDIO_RIGJNT_neck01") parentNeck.current = child;
      else if (child.name === "DOGSTUDIO_RIGJNT_neck02")
        childNeck.current = child;
      else if (child.name === "DOGSTUDIO_RIGJNT_head")
        childHead.current = child;
      else if (child.name === "DOGSTUDIO_RIGJNT_chest")
        chestBone.current = child;
      else if (child.name === "BRANCHS_RIG_01BRANCHS_MSH")
        branchGroup1.current = child;
      else if (child.name === "BRANCHS_RIG_02BRANCHS_MSH")
        branchGroup2.current = child;
      else if (child.name === "camera1_group") camGroup.current = child;
      else if (child.name === "camera1_aim") camAim.current = child;
    });
  });

  // play all the animation of foxmode(inlcudes fox and branches)
  const { actions } = useAnimations(Fox.animations, Fox.scene);
  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

    // texture for fox
  const [normalMap, diffuseMap, specularMap, sampleMatCap] = useTexture([
  "/fox/images/fox_normals.jpg",
  "/fox/images/fox_diffuse.jpg",
  "/fox/images/fox_specular.jpg",
  "/matcap/mat-2.png",
]).map((texture, i) => {
  // matcap (index 3) keeps default flipY, everything else needs flipY = false
  if (i !== 3) texture.flipY = false;

  // normal (0) and specular (2) are non-color data -> linear/NoColorSpace
  // diffuse (1) and matcap (3) are color data -> sRGB
  texture.colorSpace = i === 0 || i === 2 ? THREE.NoColorSpace : THREE.SRGBColorSpace;

  return texture;
});

const FoxMaterial = new THREE.MeshStandardMaterial({
  map: diffuseMap,                                    // color/pattern
  normalMap: normalMap,                               // surface detail
  normalScale: new THREE.Vector2(1.6, 1.6),          // bump strength
  roughnessMap: specularMap,                          // controls matte/shiny (inverted spec)

  roughness: 0.8,                                     // fallback if no map
  metalness: 0.0,                                     // keep at 0 for fur (not metal)
});

FoxMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uMatcap = { value: sampleMatCap };
  
  shader.fragmentShader = shader.fragmentShader.replace(
    "void main() {",
    `
      uniform sampler2D uMatcap;
      void main() {
    `
  );

shader.fragmentShader = shader.fragmentShader.replace(
  "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
  `
    vec3 viewDir = normalize(vViewPosition);
    vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
    vec3 y = cross(viewDir, x);
    vec2 matcapUV = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
    vec3 matcapColor = texture2D(uMatcap, matcapUV).rgb;
    gl_FragColor = vec4(mix(outgoingLight, matcapColor, 0.7), diffuseColor.a);
  `
);
};
  // texture for branches
  const [branchMatMap, brancheNormalMap] = useTexture([
    "/fox/images/branches_diffuse.jpeg",
    "/fox/images/branches_normals.jpeg",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // add branch material on branch
  // branches: switch from MeshMatcapMaterial to a real lit material
  // so branches_diffuse.jpeg renders as actual color, not a broken matcap
  const branchMaterial = new THREE.MeshStandardMaterial({
    map: branchMatMap, // real diffuse — brings back the green/brown color
    normalMap: brancheNormalMap,
    roughness: 0.85,
    metalness: 0,
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

  function onBeforeCompile(shader) {
    shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
    shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
    shader.uniforms.uProgress = material.current.uProgress;
    shader.uniforms.uDiffuseMap = { value: diffuseMap };
    shader.uniforms.uSpecularMap = { value: specularMap };

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
      uniform sampler2D uMatcapTexture1;
      uniform sampler2D uMatcapTexture2;
      uniform sampler2D uDiffuseMap;
      uniform sampler2D uSpecularMap;
      uniform float uProgress;

      void main() {
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",
      `
    vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
    vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
    float transitionFactor = 0.2;
    float progress = smoothstep(uProgress - transitionFactor, uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);
    vec4 matcapColor = mix(matcapColor2, matcapColor1, progress);

    // partial multiply darkens using real fur pattern, floor keeps it from crushing to black
    vec3 furTint = texture2D( uDiffuseMap, uv ).rgb;
    vec3 darkened = matcapColor.rgb * mix(vec3(1.0), furTint * 1.4, 0.55);
    matcapColor.rgb = max(darkened, matcapColor.rgb * 0.12);

    // much subtler specular — was overpowering at 0.25
    float specAmount = texture2D( uSpecularMap, uv ).r;
    matcapColor.rgb += specAmount * 0.08;
    `,
    );
  }

  FoxMaterial.onBeforeCompile = onBeforeCompile;

  const foxModel = useRef(Fox);

  Fox.scene.traverse((child) => {
    if (!child.isMesh) return;
    if (child.name.includes("eye")) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0x0a0605,
        roughness: 0.2,
        metalness: 0.4,
        envMapIntensity: 1.5,
      });
    } else if (child.name.includes("DOG")) {
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

  useEffect(() => {
    if (branchGroup1.current) branchGroup1.current.scale.setScalar(1.06);
    if (branchGroup2.current) branchGroup2.current.scale.setScalar(1.04);
  }, []);

  // function FloatingLeaves({ count = 18 }) {
  //   const leafTex = useTexture("/fox/images/branches_diffuse.jpeg");
  //   const leaves = useRef([]);

  //   const seeds = useRef(
  //     Array.from({ length: count }, () => ({
  //       pos: [
  //         (Math.random() - 0.5) * 2.5,
  //         (Math.random() - 0.5) * 1.5,
  //         (Math.random() - 0.5) * 1.5,
  //       ],
  //       speed: 0.2 + Math.random() * 0.3,
  //       offset: Math.random() * Math.PI * 2,
  //       scale: 0.02 + Math.random() * 0.025,
  //     })),
  //   );

  //   useFrame(({ clock }) => {
  //     const t = clock.getElapsedTime();
  //     leaves.current.forEach((mesh, i) => {
  //       if (!mesh) return;
  //       const s = seeds.current[i];
  //       mesh.position.y = s.pos[1] + Math.sin(t * s.speed + s.offset) * 0.15;
  //       mesh.position.x =
  //         s.pos[0] + Math.cos(t * s.speed * 0.6 + s.offset) * 0.08;
  //       mesh.rotation.z = Math.sin(t * s.speed + s.offset) * 0.5;
  //     });
  //   });

  //   return (
  //     <>
  //       {seeds.current.map((s, i) => (
  //         <mesh
  //           key={i}
  //           ref={(el) => (leaves.current[i] = el)}
  //           position={s.pos}
  //           scale={s.scale}
  //         >
  //           <planeGeometry args={[1, 1]} />
  //           <meshStandardMaterial
  //             map={leafTex}
  //             transparent
  //             opacity={0.85}
  //             side={THREE.DoubleSide}
  //             depthWrite={false}
  //           />
  //         </mesh>
  //       ))}
  //     </>
  //   );
  // }

  function ScatteredLeaves({ foxScene, material, count = 32 }) {
    const groupRef = useRef();

    useEffect(() => {
      if (!foxScene || !material || !groupRef.current) return;

      let leafGeo = null;
      foxScene.traverse((child) => {
        if (!leafGeo && child.name.includes("maple_leaf_01"))
          leafGeo = child.geometry;
      });
      if (!leafGeo) return;

      const group = groupRef.current;
      group.clear();

      for (let i = 0; i < count; i++) {
        const leaf = new THREE.Mesh(leafGeo, material);
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.35 + Math.random() * 1.0;
        leaf.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.25) * 0.9, // biased upward — above the fox
          Math.sin(angle) * radius - 0.25, // biased back — behind the fox
        );
        leaf.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        );
        leaf.scale.setScalar(0.5 + Math.random() * 0.6);
        leaf.userData.baseY = leaf.position.y;
        leaf.userData.speed = 0.15 + Math.random() * 0.3;
        leaf.userData.offset = Math.random() * Math.PI * 2;
        group.add(leaf);
      }
    }, [foxScene, material, count]);

    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      groupRef.current?.children.forEach((leaf) => {
        leaf.position.y =
          leaf.userData.baseY +
          Math.sin(t * leaf.userData.speed + leaf.userData.offset) * 0.05;
        leaf.rotation.z += 0.001;
      });
    });

    return <group ref={groupRef} position={[0.2, 0.1, -0.1]} />;
  }

  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (parentNeck.current && childNeck && childHead.current) {
      childHead.current.rotation.x -= 0.3647;
      childHead.current.rotation.y += 0.0148;
      childHead.current.rotation.z -= 0.1586;

      // extra: subtle head-follow toward cursor, layered on top
      childHead.current.rotation.y += pointer.current.x * 0.06;
      childHead.current.rotation.x += pointer.current.y * 0.04;
    }

    if (chestBone.current) {
      chestBone.current.position.y += Math.sin(t * 1.4) * 0.0015; // idle breathing lift
    }

    if (branchGroup1.current) {
      branchGroup1.current.rotation.z = pointer.current.x * 0.03;
    }
    if (branchGroup2.current) {
      branchGroup2.current.rotation.z = pointer.current.x * -0.02;
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
      <directionalLight position={[2, 3, 2]} color={0xfff1e0} intensity={1.2} />
      <hemisphereLight
        skyColor={0x8899ff} // cool aurora blue from the background
        groundColor={0x1a0f2e} // deep purple/black fill
        intensity={0.6}
      />
      {/* <OrbitControls /> */}
      {/* How to add pan controls */}
    </>
  );
};
export default Fox;
