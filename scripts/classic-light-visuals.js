const MODULE_ID = "classic-light-visuals";
const ICON_PATH = `modules/${MODULE_ID}/icons/classic-bulb.svg`;
const ICON_NAME = "classic-light-visuals-bulb";
const DEFAULT_SIZE = 40;
const MIN_SIZE = 20;
const MAX_SIZE = 96;

let bulbTexturePromise;
let lastCanvasZoom = null;

/** Load the module's SVG once and share the texture between all light markers. */
function loadBulbTexture() {
  if (!bulbTexturePromise) {
    bulbTexturePromise = PIXI.Assets.load(ICON_PATH).catch((error) => {
      bulbTexturePromise = undefined;
      console.error(`${MODULE_ID} | Could not load the classic bulb icon.`, error);
      ui.notifications?.warn("Classic Light Visuals: Das Glühbirnen-Symbol konnte nicht geladen werden.");
      return null;
    });
  }
  return bulbTexturePromise;
}

function getCanvasZoom() {
  return Math.abs(Number(canvas.stage?.scale?.x)) || 1;
}

function getConfiguredSize() {
  const value = Number(game.settings.get(MODULE_ID, "bulbSize"));
  return Number.isFinite(value) ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)) : DEFAULT_SIZE;
}

/**
 * AmbientLight's V14 shape controls expose their handles through the public
 * `controls.handles` accessor. A circle light has `scale` and `translate`
 * handles; the translate handle is the small marker at the light's origin.
 */
function getLightOriginHandle(light) {
  const handles = light?.controls?.handles?.children;
  if (!Array.isArray(handles) || handles.length === 0) return null;

  return handles.find((handle) => handle?.name === "translate")
    ?? light.controls.handles.getChildByName?.("translate")
    ?? handles[1]
    ?? handles[0]
    ?? null;
}

async function applyBulbToLight(light) {
  if (!canvas?.ready || !light) return;

  const handle = getLightOriginHandle(light);
  if (!handle) return;

  const texture = await loadBulbTexture();
  if (!texture || handle.destroyed) return;

  // The handle remains the interactive Foundry control. The non-interactive
  // sprite is only a visual overlay, so light selection and dragging remain
  // handled by Foundry itself.
  let icon = handle.children?.find((child) => child?.name === ICON_NAME);
  if (!icon) {
    icon = new PIXI.Sprite(texture);
    icon.name = ICON_NAME;
    icon.anchor.set(0.5, 0.5);
    icon.eventMode = "none";
    icon.interactive = false;
    handle.addChild(icon);
  }

  // Keep the chosen size stable on screen while the canvas is zoomed.
  const zoom = getCanvasZoom();
  const localSize = getConfiguredSize() / zoom;
  icon.width = localSize;
  icon.height = localSize;
  icon.position.set(0, 0);
  icon.visible = true;
}

function refreshAllLightIcons() {
  if (!canvas?.ready || !canvas.lighting?.placeables) return;
  lastCanvasZoom = getCanvasZoom();
  for (const light of canvas.lighting.placeables) {
    void applyBulbToLight(light);
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "bulbSize", {
    name: "Classic Light Visuals: Glühbirnen-Größe",
    hint: "Größe des klassischen Ambient-Light-Symbols in Bildschirmpixeln. Gilt nur für deinen eigenen Client.",
    scope: "client",
    config: true,
    type: Number,
    range: {
      min: MIN_SIZE,
      max: MAX_SIZE,
      step: 4
    },
    default: DEFAULT_SIZE,
    onChange: () => refreshAllLightIcons()
  });
});

// Public PlaceableObject hooks. These run after an AmbientLight is drawn or
// refreshed, including when lights are created, moved, or edited.
Hooks.on("drawAmbientLight", (light) => {
  void applyBulbToLight(light);
});

Hooks.on("refreshAmbientLight", (light) => {
  void applyBulbToLight(light);
});

Hooks.on("canvasReady", () => refreshAllLightIcons());
Hooks.on("canvasPan", () => {
  const zoom = getCanvasZoom();
  if (lastCanvasZoom === null || Math.abs(zoom - lastCanvasZoom) > 0.0001) {
    refreshAllLightIcons();
  }
});
