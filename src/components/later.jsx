useEffect(() => {
  const crossfadeTo = (newTex) => {
    // stop any in-flight wipe so we never leave a half-finished state
    gsap.killTweensOf(material.current.uProgress);

    // snapshot whatever is currently showing as the new "from" color,
    // set the new target, and reset the wipe — all synchronously,
    // so this is safe even if it interrupts a previous crossfade
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

  const cleanupFns = [];

  Object.entries(hoverMap).forEach(([key, tex]) => {
    const el = document.querySelector(`.title[img-title="${key}"]`);
    if (!el) return;
    const handler = () => crossfadeTo(tex);
    el.addEventListener("mouseenter", handler);
    cleanupFns.push(() => el.removeEventListener("mouseenter", handler));
  });

  const titlesEl = document.querySelector(`.titles`);
  const leaveHandler = () => crossfadeTo(mat2);
  titlesEl?.addEventListener("mouseleave", leaveHandler);
  cleanupFns.push(() =>
    titlesEl?.removeEventListener("mouseleave", leaveHandler),
  );

  return () => cleanupFns.forEach((fn) => fn());
}, []);