import { isMotionEnabled } from "./motion.js";

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform vec2 uRotation;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPointSize;
  uniform float uAspect;
  varying vec3 vColor;
  varying float vDepth;
  varying float vTwinkle;
  void main() {
    float sway = sin(uTime * 0.42 + aPosition.y * 2.0) * 0.045;
    float angleY = uRotation.x + uPointer.x * 0.5 + sway;
    float angleX = uRotation.y + uPointer.y * 0.35 + uScroll * 0.00022;
    float cY = cos(angleY);
    float sY = sin(angleY);
    float cX = cos(angleX);
    float sX = sin(angleX);
    float pulse = 1.0 + sin(uTime * 1.1 + aPosition.x * 4.0 + aPosition.y * 3.0) * 0.018;
    vec3 p = aPosition * pulse;
    p = vec3(p.x * cY - p.z * sY, p.y, p.x * sY + p.z * cY);
    p = vec3(p.x, p.y * cX - p.z * sX, p.y * sX + p.z * cX);
    float depth = 3.35 + p.z;
    float fit = min(1.0, uAspect);
    gl_Position = vec4(p.x * 1.7 * fit / (uAspect * depth), p.y * 1.7 * fit / depth, p.z * 0.2, 1.0);
    float twinkle = 0.5 + 0.5 * sin(uTime * 2.4 + aPosition.y * 37.0);
    gl_PointSize = uPointSize * (1.0 + (p.z + 1.0) * 0.48) * (0.9 + twinkle * 0.2);
    vColor = aColor;
    vDepth = (p.z + 1.0) * 0.5;
    vTwinkle = twinkle;
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform float uPointPass;
  varying vec3 vColor;
  varying float vDepth;
  varying float vTwinkle;
  void main() {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float point = mix(0.58, 1.0 - smoothstep(0.23, 0.5, radius), uPointPass);
    gl_FragColor = vec4(vColor, point * (0.42 + vDepth * 0.48 + vTwinkle * 0.1));
  }
`;

function spherePoints(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = golden * i;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    positions.set([x, y, z], i * 3);
    const blend = (z + 1) / 2;
    colors.set([
      0.42 + blend * 0.45,
      0.55 + blend * 0.38,
      0.28 + (1 - blend) * 0.42
    ], i * 3);
  }
  return { positions, colors };
}

function orbitPoints() {
  const positions = [];
  const colors = [];
  const rings = [
    { radius: 1.32, tilt: 0.72, color: [0.84, 0.98, 0.38] },
    { radius: 1.42, tilt: -0.55, color: [1.0, 0.48, 0.37] }
  ];
  for (const ring of rings) {
    for (let i = 0; i < 241; i += 1) {
      const a = i / 240 * Math.PI * 2;
      const x = Math.cos(a) * ring.radius;
      const z = Math.sin(a) * ring.radius;
      positions.push(x, Math.sin(a) * ring.radius * Math.sin(ring.tilt), z * Math.cos(ring.tilt));
      colors.push(...ring.color);
    }
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown WebGL linking error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

export function initHeroScene(canvas) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!gl) {
    canvas.closest(".hero-art")?.classList.add("hero-art--fallback");
    return () => {};
  }
  try {
    const program = createProgram(gl);
    const attributes = {
      position: gl.getAttribLocation(program, "aPosition"),
      color: gl.getAttribLocation(program, "aColor")
    };
    const uniforms = {
      rotation: gl.getUniformLocation(program, "uRotation"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      time: gl.getUniformLocation(program, "uTime"),
      scroll: gl.getUniformLocation(program, "uScroll"),
      pointSize: gl.getUniformLocation(program, "uPointSize"),
      aspect: gl.getUniformLocation(program, "uAspect"),
      pointPass: gl.getUniformLocation(program, "uPointPass")
    };
    const sphere = spherePoints(820);
    const orbit = orbitPoints();
    const pointBuffers = {
      position: gl.createBuffer(),
      color: gl.createBuffer()
    };
    if (!pointBuffers.position || !pointBuffers.color) throw new Error("Unable to create WebGL geometry buffers.");
    const orbitBuffers = {
      position: gl.createBuffer(),
      color: gl.createBuffer()
    };
    if (!orbitBuffers.position || !orbitBuffers.color) throw new Error("Unable to create WebGL orbit buffers.");
    for (const [buffers, data] of [[pointBuffers, sphere], [orbitBuffers, orbit]]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.bufferData(gl.ARRAY_BUFFER, data.colors, gl.STATIC_DRAW);
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let width = 1;
    let height = 1;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let dragging = false;
    let scrollY = window.scrollY;
    let visible = true;
    let frame = 0;
    let disposed = false;
    const start = performance.now();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function drawGeometry(buffers, count, mode, pointSize, pointPass, first = 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.enableVertexAttribArray(attributes.position);
      gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.enableVertexAttribArray(attributes.color);
      gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniforms.pointSize, pointSize);
      gl.uniform1f(uniforms.pointPass, pointPass);
      gl.drawArrays(mode, first, count);
    }

    function render(now) {
      if (disposed || !visible) return;
      frame = 0;
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);
      const elapsed = isMotionEnabled() ? now - start : 0;
      pointerX += (targetX - pointerX) * 0.08;
      pointerY += (targetY - pointerY) * 0.08;
      gl.uniform2f(uniforms.rotation, elapsed * 0.00032, Math.sin(elapsed * 0.00016) * 0.14);
      const dragBoost = dragging ? 1.4 : 1;
      gl.uniform2f(uniforms.pointer, pointerX * dragBoost, pointerY * dragBoost);
      gl.uniform1f(uniforms.time, elapsed / 1000);
      gl.uniform1f(uniforms.scroll, scrollY);
      gl.uniform1f(uniforms.aspect, width / height);
      const ringSize = 241;
      drawGeometry(orbitBuffers, ringSize, gl.LINE_STRIP, Math.min(width, height) * 0.003, 0);
      drawGeometry(orbitBuffers, ringSize, gl.LINE_STRIP, Math.min(width, height) * 0.003, 0, ringSize);
      drawGeometry(pointBuffers, sphere.positions.length / 3, gl.POINTS, Math.min(width, height) * (coarsePointer.matches ? 0.012 : 0.009), 1);
      if (isMotionEnabled() && !document.hidden) frame = requestAnimationFrame(render);
    }

    const onPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = -((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const onPointerDown = (event) => {
      dragging = true;
      canvas.setPointerCapture?.(event.pointerId);
      onPointer(event);
    };
    const onPointerUp = () => { dragging = false; };
    const onScroll = () => { scrollY = window.scrollY; };
    const host = canvas.closest(".hero-art") ?? canvas;
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointerleave", onPointerUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden) {
        if (!isMotionEnabled()) render(performance.now());
        else frame = requestAnimationFrame(render);
      }
    }, { threshold: 0.02 });
    observer.observe(canvas);
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (visible) {
        if (!isMotionEnabled()) render(performance.now());
        else if (!frame) frame = requestAnimationFrame(render);
      }
    };
    const onMotionPreferenceChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!visible || document.hidden) return;
      if (!isMotionEnabled()) render(performance.now());
      else frame = requestAnimationFrame(render);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("motionpreferencechange", onMotionPreferenceChange);
    if (!isMotionEnabled()) render(performance.now());
    else frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("motionpreferencechange", onMotionPreferenceChange);
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointerleave", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      gl.deleteBuffer(pointBuffers.position);
      gl.deleteBuffer(pointBuffers.color);
      gl.deleteBuffer(orbitBuffers.position);
      gl.deleteBuffer(orbitBuffers.color);
      gl.deleteProgram(program);
    };
  } catch (error) {
    console.error("The hero WebGL scene could not be initialized.", error);
    canvas.closest(".hero-art")?.classList.add("hero-art--fallback");
    return () => {};
  }
}
