'use strict';

(() => {
  const layer = document.querySelector('[data-pramanix-background]');
  if (!layer) return;

  const canvas = layer.querySelector('.pramanix-canvas');
  const poster = layer.querySelector('.pramanix-poster');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const viewportPreference = window.matchMedia('(max-width: 760px)');
  const usePoster = () => motionPreference.matches || viewportPreference.matches;

  // These are the only visual tuning values used by the homepage component.
  // scale is CSS pixels per Spine world unit; x/y are viewport fractions.
  const config = Object.freeze({ scale: 0.544, x: 0.16, y: 0.015 });
  window.__PRAMANIX_CONFIG__ = config;

  let gl;
  let shader;
  let batcher;
  let skeletonRenderer;
  let assetManager;
  let skeleton;
  let animationState;
  let animationFrame = 0;
  let loadFrame = 0;
  let lastTime = 0;
  let loadTimeout = 0;
  let failed = false;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let boundsCenterX = 0;
  let boundsCenterY = 0;
  let worldWidth = 1;
  let worldHeight = 1;
  let mvp;

  const showPoster = () => {
    poster.hidden = false;
    canvas.style.visibility = 'hidden';
    layer.dataset.state = 'fallback';
  };

  const showModel = () => {
    poster.hidden = true;
    canvas.style.visibility = 'visible';
    layer.dataset.state = 'ready';
  };

  const stop = () => {
    clearTimeout(loadTimeout);
    if (loadFrame) cancelAnimationFrame(loadFrame);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    loadFrame = 0;
    animationFrame = 0;
  };

  const fail = error => {
    failed = true;
    stop();
    showPoster();
    layer.dataset.error = error && error.message ? error.message : 'load-failed';
    console.warn('[pramanix-background] model fallback:', error);
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(box.width * ratio));
    const nextHeight = Math.max(1, Math.floor(box.height * ratio));
    if (nextWidth === canvasWidth && nextHeight === canvasHeight) return;
    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    if (gl) gl.viewport(0, 0, nextWidth, nextHeight);
  };

  const setCamera = () => {
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    // Keep the desktop composition proportional on smaller laptop displays.
    const viewScale = config.scale * Math.min(1, cssWidth / 1440, cssHeight / 900);
    worldWidth = cssWidth / viewScale;
    worldHeight = cssHeight / viewScale;
    const cameraX = boundsCenterX - (config.x * cssWidth) / viewScale;
    const cameraY = boundsCenterY + (config.y * cssHeight) / viewScale;
    mvp.ortho2d(cameraX - worldWidth / 2, cameraY - worldHeight / 2, worldWidth, worldHeight);
  };

  const draw = now => {
    animationFrame = 0;
    if (failed || usePoster() || !skeleton || !animationState || !gl) return;
    try {
    const seconds = now / 1000;
    const delta = Math.min(0.05, lastTime ? seconds - lastTime : 0);
    lastTime = seconds;
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    animationState.update(delta);
    animationState.apply(skeleton);
    skeleton.updateWorldTransform();
    shader.bind();
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    setCamera();
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
    batcher.begin(shader);
    skeletonRenderer.premultipliedAlpha = true;
    skeletonRenderer.draw(batcher, skeleton);
    batcher.end();
    shader.unbind();
    if (layer.dataset.state !== 'ready') showModel();
    animationFrame = requestAnimationFrame(draw);
    } catch (error) {
      fail(error);
    }
  };

  const readModel = () => {
    const atlasPath = layer.dataset.atlas;
    const skelPath = layer.dataset.skel;
    assetManager = new spine.webgl.AssetManager(gl);
    assetManager.loadBinary(skelPath);
    assetManager.loadTextureAtlas(atlasPath);
    const poll = () => {
      if (failed) return;
      if (!assetManager.isLoadingComplete()) {
        loadFrame = requestAnimationFrame(poll);
        return;
      }
      if (assetManager.hasErrors()) {
        fail(new Error(JSON.stringify(assetManager.getErrors())));
        return;
      }
      clearTimeout(loadTimeout);
      try {
        const atlas = assetManager.get(atlasPath);
        const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
        const binary = new spine.SkeletonBinary(atlasLoader);
        binary.scale = 1;
        const data = binary.readSkeletonData(assetManager.get(skelPath));
        skeleton = new spine.Skeleton(data);
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        const offset = new spine.Vector2();
        const size = new spine.Vector2();
        skeleton.getBounds(offset, size, []);
        boundsCenterX = offset.x + size.x / 2;
        boundsCenterY = offset.y + size.y / 2;
        animationState = new spine.AnimationState(new spine.AnimationStateData(data));
        animationState.setAnimation(0, 'Idle', true);
        lastTime = 0;
        animationFrame = requestAnimationFrame(draw);
      } catch (error) {
        fail(error);
      }
    };
    loadFrame = requestAnimationFrame(poll);
    loadTimeout = setTimeout(() => fail(new Error('Model loading timed out')), 30000);
  };

  const init = () => {
    if (usePoster() || !window.spine || !window.spine.webgl) {
      showPoster();
      layer.dataset.state = motionPreference.matches ? 'reduced-motion' : viewportPreference.matches ? 'mobile-fallback' : 'unsupported';
      return;
    }
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) || canvas.getContext('experimental-webgl', { alpha: true });
    if (!gl) {
      fail(new Error('WebGL is unavailable'));
      return;
    }
    try {
      mvp = new spine.webgl.Matrix4();
      shader = spine.webgl.Shader.newTwoColoredTextured(gl);
      batcher = new spine.webgl.PolygonBatcher(gl);
      skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
      resize();
      readModel();
    } catch (error) {
      fail(error);
    }
  };

  poster.addEventListener('error', () => { layer.dataset.posterError = 'true'; });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fail(new Error('WebGL context lost'));
  });
  new ResizeObserver(resize).observe(canvas);
  const syncMode = () => {
    if (usePoster()) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      showPoster();
      layer.dataset.state = motionPreference.matches ? 'reduced-motion' : 'mobile-fallback';
    } else if (!failed && skeleton && !animationFrame) {
      lastTime = 0;
      animationFrame = requestAnimationFrame(draw);
    } else if (!failed && !assetManager) {
      init();
    }
  };
  motionPreference.addEventListener('change', syncMode);
  viewportPreference.addEventListener('change', syncMode);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (!failed && !usePoster() && skeleton && !animationFrame) {
      lastTime = 0;
      animationFrame = requestAnimationFrame(draw);
    }
  });
  window.addEventListener('pagehide', stop, { once: true });
  init();
})();
