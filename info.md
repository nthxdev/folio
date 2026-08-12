**Console messages while working**
+ React DevTools warning: Browser extension for debugging React. Optional—install if you want.
+ THREE.Clock deprecation: Three.js library saying Clock is outdated, use Timer instead. Won't break your code now, but update eventually when you use timing/animation.


  const headBone = useRef(null);
  const neck1Bone = useRef(null);
  const neck2Bone = useRef(null);
  const leftEyeBone = useRef(null);
  const rightEyeBone = useRef(null);

   // Find and store bone references by exact name
  useEffect(() => {
    Fox.scene.traverse((child) => {
      if (child.name === "DOGSTUDIO_RIGINT_head") {
        headBone.current = child;
      }
      if (child.name === "DOGSTUDIO_RIGINT_neck1") {
        neck1Bone.current = child;
      }
      if (child.name === "DOGSTUDIO_RIGINT_neck2") {
        neck2Bone.current = child;
      }
      if (child.name === "DOGSTUDIO_RIGDOGSTUDIO_Leye") {
        leftEyeBone.current = child;
      }
      if (child.name === "DOGSTUDIO_RIGDOGSTUDIO_Reye") {
        rightEyeBone.current = child;
      }
    });
  }, [Fox]);

  // Make head and eyes look at camera every frame
  useFrame(() => {
    if (headBone.current && camera) {
      headBone.current.lookAt(camera.position);
    }

    // Optional: make eyes look at camera for extra effect
    if (leftEyeBone.current && camera) {
      leftEyeBone.current.lookAt(camera.position);
    }
    if (rightEyeBone.current && camera) {
      rightEyeBone.current.lookAt(camera.position);
    }
  });
  
-----
  const headBone = useRef(null);
  const neckBone = useRef(null);
  // Find and store head bone reference
  useEffect(() => {
    let head = null;
    let neck = null;

    Fox.scene.traverse((child) => {
      // Common bone names - adjust based on your model's skeleton
      if (child.isBone || child.name.toLowerCase().includes("head")) {
        head = child;
      }
      if (child.isBone || child.name.toLowerCase().includes("neck")) {
        neck = child;
      }
    });

    headBone.current = head;
    neckBone.current = neck;

    // Debugging: log all bone names
    Fox.scene.traverse((child) => {
      if (child.isBone) {
        console.log("Bone found:", child.name);
      }
    });
  }, [Fox]);

  // Make head look at camera
  useFrame(() => {
    if (headBone.current && camera) {
      // Make the head look at the camera
      headBone.current.lookAt(camera.position);
    }
  });