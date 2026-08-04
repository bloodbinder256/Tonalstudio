let imagesState = [];
let gradientStops = [
  { pos: 0, color: "#000000" },
  { pos: 1, color: "#ffffff" },
];
let activeStopIndex = -1;
let isDragging = false;

let globalPattern = {
  img: null,
  src: null,
  scaleW: 100,
  scaleH: 100,
  opacity: 100,
  blend: "source-over",
  layout: "tile",
};

let adjustments = {
  global: {
    hue: 0,
    saturation: 100,
    lightness: 100,
    brightness: 0,
    contrast: 100,
    highlights: 0,
    shadows: 0,
  },
  gradient: {
    hue: 0,
    saturation: 100,
    lightness: 100,
    brightness: 0,
    contrast: 100,
    highlights: 0,
    shadows: 0,
  },
  pattern: {
    hue: 0,
    saturation: 100,
    lightness: 100,
    brightness: 0,
    contrast: 100,
    highlights: 0,
    shadows: 0,
  },
};
let activeAdjTab = "global";

let uiState = {
  packName: "Bulk Tonal Studio",
  packDescription: "Created with Bulk Tonal Studio",
  packType: "java",
  packFolder: "blocks",
  packIconSrc: null,
  packAutoPot: true,
  paletteReduce: false,
  paletteColors: 16,
  dithering: false,
  tilePreview: true,
  history: { undo: [], redo: [] },
};

lucide.createIcons();

function showNotification(message) {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className =
      "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none items-end";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className =
    "bg-white text-blue-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 opacity-0 translate-y-2 pointer-events-none";
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 750);
}

const fileInput = document.getElementById("fileInput");
const editorGrid = document.getElementById("editorGrid");
const emptyState = document.getElementById("emptyState");
const gradientBar = document.getElementById("gradientBar");
const themeToggleBtn = document.getElementById("toggleDarkModeBtn");
const exportSizeSelect = document.getElementById("exportSizeSelect");
const downloadPackBtn = document.getElementById("downloadPackBtn");
const exportDropdownBtn = document.getElementById("exportDropdownBtn");
const exportDropdown = document.getElementById("exportDropdown");
const toolsDropdownBtn = document.getElementById("toolsDropdownBtn");
const toolsDropdown = document.getElementById("toolsDropdown");
const sortDropdownBtn = document.getElementById("sortDropdownBtn");
const sortDropdown = document.getElementById("sortDropdown");
const openPackSettingsBtn = document.getElementById("openPackSettingsBtn");
const openAtlasModalBtn = document.getElementById("openAtlasModalBtn");
const openBlockPreviewBtn = document.getElementById("openBlockPreviewBtn");
const downloadAtlasBtn = document.getElementById("downloadAtlasBtn");
const tilePreviewToggle = document.getElementById("tilePreviewToggle");
const blockFaceCanvas = document.getElementById("blockFaceCanvas");
const tilePreviewArea = document.getElementById("tilePreviewArea");
const packNameInput = document.getElementById("packNameInput");
const packDescriptionInput = document.getElementById("packDescriptionInput");
const packTypeSelect = document.getElementById("packTypeSelect");
const packPathSelect = document.getElementById("packPathSelect");
const packIconInput = document.getElementById("packIconInput");
const packIconPreview = document.getElementById("packIconPreview");
const packAutoPotToggle = document.getElementById("packAutoPotToggle");
const ditherToggle = document.getElementById("ditherToggle");
const paletteToggle = document.getElementById("paletteToggle");
const paletteColorsInput = document.getElementById("paletteColors");
const paletteCountLabel = document.getElementById("paletteCountLabel");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

const savedBoxSize = localStorage.getItem("tonal_box_size");
if (savedBoxSize) {
  document.getElementById("boxSizeSlider").value = savedBoxSize;
  document.getElementById("boxSizeDisplay").textContent = savedBoxSize + "px";
  document.documentElement.style.setProperty("--box-size", savedBoxSize + "px");
}

document.getElementById("openResizeModalBtn").addEventListener("click", () => {
  document.getElementById("resizeModal").showModal();
});

document.getElementById("boxSizeSlider").addEventListener("input", (e) => {
  const val = e.target.value + "px";
  document.getElementById("boxSizeDisplay").textContent = val;
  document.documentElement.style.setProperty("--box-size", val);
  localStorage.setItem("tonal_box_size", e.target.value);
});

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    if (themeToggleBtn) themeToggleBtn.textContent = "Light";
  } else {
    document.documentElement.classList.remove("dark");
    if (themeToggleBtn) themeToggleBtn.textContent = "Dark";
  }
  localStorage.setItem("tonal_theme", theme);
}

function loadTheme() {
  const theme = localStorage.getItem("tonal_theme") || "light";
  applyTheme(theme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    applyTheme(isDark ? "dark" : "light");
  });
}

function closeAllDropdowns() {
  [exportDropdown, toolsDropdown, sortDropdown].forEach((menu) => {
    if (!menu || !menu.classList.contains("open")) return;
    anime({
      targets: menu,
      opacity: [1, 0],
      translateY: [0, -8],
      duration: 170,
      easing: "easeInQuad",
      complete: () => {
        menu.classList.remove("open");
        menu.classList.add("hidden");
      },
    });
  });
}

function toggleDropdown(menu) {
  if (!menu) return;
  const isOpen = menu.classList.contains("open");
  closeAllDropdowns();
  if (!isOpen) {
    menu.classList.remove("hidden");
    menu.classList.add("open");
    anime({
      targets: menu,
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: 220,
      easing: "easeOutQuad",
    });
  }
}

if (exportDropdownBtn) {
  exportDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(exportDropdown);
  });
}

if (toolsDropdownBtn) {
  toolsDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(toolsDropdown);
  });
}

if (sortDropdownBtn) {
  sortDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(sortDropdown);
  });
}

document.addEventListener("click", closeAllDropdowns);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDropdowns();
});

if (downloadPackBtn) {
  downloadPackBtn.addEventListener("click", () => downloadTexturePack());
}

if (openPackSettingsBtn) {
  openPackSettingsBtn.addEventListener("click", () => {
    packNameInput.value = uiState.packName;
    packDescriptionInput.value = uiState.packDescription;
    packTypeSelect.value = uiState.packType;
    packPathSelect.value = uiState.packFolder;
    packAutoPotToggle.checked = uiState.packAutoPot;
    if (uiState.packIconSrc) {
      packIconPreview.innerHTML = `<img src="${uiState.packIconSrc}" class="w-full h-full object-contain">`;
    } else {
      packIconPreview.innerHTML = `<span class="text-xs text-gray-500">Icon</span>`;
    }
    document.getElementById("packSettingsModal").showModal();
  });
}

if (openAtlasModalBtn) {
  openAtlasModalBtn.addEventListener("click", async () => {
    await renderAtlas();
    document.getElementById("atlasModal").showModal();
  });
}

if (openBlockPreviewBtn) {
  openBlockPreviewBtn.addEventListener("click", () => {
    renderBlockPreview();
    document.getElementById("blockPreviewModal").showModal();
  });
}

if (downloadAtlasBtn) {
  downloadAtlasBtn.addEventListener("click", () => {
    const canvas = document.getElementById("atlasCanvas");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "texture_atlas.png";
    a.click();
    showNotification("Atlas downloaded!");
  });
}

if (document.getElementById("sortNameAZ")) {
  document.getElementById("sortNameAZ").addEventListener("click", () => {
    sortImagesBy("name", true);
    closeAllDropdowns();
  });
}
if (document.getElementById("sortNameZA")) {
  document.getElementById("sortNameZA").addEventListener("click", () => {
    sortImagesBy("name", false);
    closeAllDropdowns();
  });
}
if (document.getElementById("sortNewOld")) {
  document.getElementById("sortNewOld").addEventListener("click", () => {
    sortImagesBy("new", true);
    closeAllDropdowns();
  });
}
if (document.getElementById("sortOldNew")) {
  document.getElementById("sortOldNew").addEventListener("click", () => {
    sortImagesBy("new", false);
    closeAllDropdowns();
  });
}

if (packIconInput) {
  packIconInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uiState.packIconSrc = ev.target.result;
      packIconPreview.innerHTML = `<img src="${uiState.packIconSrc}" class="w-full h-full object-contain">`;
    };
    reader.readAsDataURL(file);
  });
}

if (paletteToggle) {
  paletteToggle.addEventListener("change", (e) => {
    uiState.paletteReduce = e.target.checked;
    updateAllPreviews();
  });
}

if (ditherToggle) {
  ditherToggle.addEventListener("change", (e) => {
    uiState.dithering = e.target.checked;
    updateAllPreviews();
  });
}

if (paletteColorsInput) {
  paletteColorsInput.addEventListener("input", (e) => {
    uiState.paletteColors = parseInt(e.target.value, 10);
    paletteCountLabel.textContent = uiState.paletteColors;
    updateAllPreviews();
  });
}

if (undoBtn) {
  undoBtn.addEventListener("click", undo);
}

if (redoBtn) {
  redoBtn.addEventListener("click", redo);
}

if (packTypeSelect) {
  packTypeSelect.addEventListener("change", (e) => {
    uiState.packType = e.target.value;
  });
}

if (packPathSelect) {
  packPathSelect.addEventListener("change", (e) => {
    uiState.packFolder = e.target.value;
  });
}

if (packAutoPotToggle) {
  packAutoPotToggle.addEventListener("change", (e) => {
    uiState.packAutoPot = e.target.checked;
  });
}

if (document.getElementById("savePackSettingsBtn")) {
  document
    .getElementById("savePackSettingsBtn")
    .addEventListener("click", () => {
      uiState.packName = packNameInput.value.trim() || "Bulk Tonal Studio";
      uiState.packDescription =
        packDescriptionInput.value.trim() || "Created with Bulk Tonal Studio";
      uiState.packType = packTypeSelect.value;
      uiState.packFolder = packPathSelect.value;
      uiState.packAutoPot = packAutoPotToggle.checked;
      document.getElementById("packSettingsModal").close();
      showNotification("Pack settings saved");
    });
}

loadTheme();

function renderBlockPreview() {
  const canvas = blockFaceCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imagesState.length === 0) {
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "16px Inter, sans-serif";
    ctx.fillText("No texture loaded", 20, 120);
    tilePreviewArea.innerHTML =
      "<div class='text-sm text-gray-500'>Upload textures to preview.</div>";
    return;
  }

  tilePreviewArea.innerHTML = "";
  const tileCanvas = document.createElement("canvas");
  const tileSize = 64;
  tileCanvas.width = tileSize;
  tileCanvas.height = tileSize;
  const tileCtx = tileCanvas.getContext("2d");
  tileCtx.imageSmoothingEnabled = false;

  const first = imagesState[0];
  const img = new Image();
  img.onload = () => {
    tileCtx.clearRect(0, 0, tileSize, tileSize);
    tileCtx.drawImage(img, 0, 0, tileSize, tileSize);
    if (uiState.tilePreview) {
      const columns = 4;
      const rows = 4;
      const board = document.createElement("div");
      board.className = "grid grid-cols-4 gap-1 p-2 bg-gray-100 rounded-2xl";
      for (let i = 0; i < columns * rows; i++) {
        const item = document.createElement("div");
        item.className =
          "w-16 h-16 border border-gray-200 overflow-hidden rounded-lg bg-white";
        const image = document.createElement("img");
        image.src = tileCanvas.toDataURL("image/png");
        image.className = "w-full h-full object-cover";
        item.appendChild(image);
        board.appendChild(item);
      }
      tilePreviewArea.appendChild(board);
    } else {
      const image = document.createElement("img");
      image.src = tileCanvas.toDataURL("image/png");
      image.className =
        "w-full h-full object-cover rounded-2xl border border-gray-200";
      tilePreviewArea.appendChild(image);
    }

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const drawSize = Math.min(canvas.width, canvas.height) - 40;
    const offset = 20;
    ctx.drawImage(img, offset, offset, drawSize, drawSize);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 4;
    ctx.strokeRect(offset, offset, drawSize, drawSize);
  };
  img.src = first.src;
}

async function renderAtlas() {
  const canvas = document.getElementById("atlasCanvas");
  const ctx = canvas.getContext("2d");
  if (imagesState.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#64748b";
    ctx.font = "16px Inter, sans-serif";
    ctx.fillText("Upload textures to build an atlas.", 20, 40);
    return;
  }
  const textureSize = getExportTextureSize() || 128;
  const count = imagesState.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  canvas.width = Math.min(2048, cols * textureSize);
  canvas.height = Math.min(2048, rows * textureSize);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i++) {
    const obj = imagesState[i];
    const dataUrl = await getProcessedImage(obj);
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });
    const x = (i % cols) * textureSize;
    const y = Math.floor(i / cols) * textureSize;
    ctx.drawImage(img, x, y, textureSize, textureSize);
  }
}

function updatePackSettingsUI() {
  if (!packNameInput || !packDescriptionInput) return;
  packNameInput.value = uiState.packName;
  packDescriptionInput.value = uiState.packDescription;
  packTypeSelect.value = uiState.packType;
  packPathSelect.value = uiState.packFolder;
  packAutoPotToggle.checked = uiState.packAutoPot;
  if (uiState.packIconSrc) {
    packIconPreview.innerHTML = `<img src="${uiState.packIconSrc}" class="w-full h-full object-contain">`;
  } else {
    packIconPreview.innerHTML = `<span class="text-xs text-gray-500">Icon</span>`;
  }
}

function nextPowerOfTwo(value) {
  return 2 ** Math.ceil(Math.log2(value));
}

function updateGradientBarVisual() {
  const sorted = [...gradientStops].sort((a, b) => a.pos - b.pos);
  const stopsString = sorted
    .map((s) => `${s.color} ${s.pos * 100}%`)
    .join(", ");
  gradientBar.style.background = `linear-gradient(to right, ${stopsString})`;
}

function renderGradientBar() {
  gradientBar.innerHTML = "";
  updateGradientBarVisual();
  gradientStops
    .sort((a, b) => a.pos - b.pos)
    .forEach((stop, i) => {
      const marker = document.createElement("div");
      marker.className = `marker ${i === activeStopIndex ? "active" : ""}`;
      marker.style.left = `${stop.pos * 100}%`;

      marker.onmousedown = (e) => {
        e.stopPropagation();
        activeStopIndex = i;
        isDragging = true;
        updateStopControls();
        renderGradientBar();
      };

      gradientBar.appendChild(marker);
    });
}

gradientBar.onmousedown = (e) => {
  if (isDragging) return;
  const rect = gradientBar.getBoundingClientRect();
  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  gradientStops.push({ pos, color: "#808080" });
  gradientStops.sort((a, b) => a.pos - b.pos);
  activeStopIndex = gradientStops.findIndex((s) => s.pos === pos);
  renderGradientBar();
  updateStopControls();
  updateAllPreviews();
};

window.addEventListener("mousemove", (e) => {
  if (!isDragging || activeStopIndex === -1) return;
  const rect = gradientBar.getBoundingClientRect();
  let pos = (e.clientX - rect.left) / rect.width;
  pos = Math.max(0, Math.min(1, pos));
  gradientStops[activeStopIndex].pos = pos;
  updateGradientBarVisual();
  const markers = document.querySelectorAll(".marker");
  if (markers[activeStopIndex])
    markers[activeStopIndex].style.left = `${pos * 100}%`;
});

window.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    gradientStops.sort((a, b) => a.pos - b.pos);
    activeStopIndex = gradientStops.findIndex(
      (s) => s.pos === gradientStops[activeStopIndex]?.pos,
    );
    updateAllPreviews();
  }
});

function updateStopControls() {
  const controls = document.getElementById("stopControls");
  if (activeStopIndex === -1) {
    controls.classList.add("hidden");
    return;
  }
  controls.classList.remove("hidden");
  const colorInput = document.getElementById("activeColor");
  colorInput.value = gradientStops[activeStopIndex].color;
  colorInput.oninput = (e) => {
    gradientStops[activeStopIndex].color = e.target.value;
    updateGradientBarVisual();
    updateAllPreviews();
  };
  document.getElementById("deleteStopBtn").onclick = () => {
    if (gradientStops.length > 2) {
      gradientStops.splice(activeStopIndex, 1);
      activeStopIndex = -1;
      renderGradientBar();
      updateStopControls();
      updateAllPreviews();
    }
  };
}

document.getElementById("openModalBtn").addEventListener("click", () => {
  renderGradientBar();
  document.getElementById("gradientModal").showModal();
});

document.getElementById("openPatternModalBtn").addEventListener("click", () => {
  document.getElementById("patternModal").showModal();
});

// Adjustment Listeners
const adjControls = [
  { id: "adjHue", key: "hue", suffix: "°" },
  { id: "adjSat", key: "saturation", suffix: "%" },
  { id: "adjLit", key: "lightness", suffix: "%" },
  { id: "adjBri", key: "brightness", suffix: "" },
  { id: "adjCon", key: "contrast", suffix: "%" },
  { id: "adjHigh", key: "highlights", suffix: "" },
  { id: "adjShad", key: "shadows", suffix: "" },
];

document
  .getElementById("openAdjustmentsModalBtn")
  .addEventListener("click", () => {
    document.getElementById("adjustmentsModal").showModal();
  });

const adjTabs = ["global", "gradient", "pattern"];

function switchAdjTab(tab) {
  activeAdjTab = tab;
  adjTabs.forEach((t) => {
    const el = document.getElementById(
      "tab" + t.charAt(0).toUpperCase() + t.slice(1),
    );
    if (t === tab) {
      el.className =
        "text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 pb-1 flex-1 transition-all";
    } else {
      el.className =
        "text-sm font-bold text-gray-500 hover:text-gray-700 border-b-2 border-transparent pb-1 flex-1 transition-all";
    }
  });

  adjControls.forEach((ctrl) => {
    const el = document.getElementById(ctrl.id);
    if (el) {
      el.value = adjustments[activeAdjTab][ctrl.key];
      document.getElementById(`adjVal${ctrl.id.substring(3)}`).textContent =
        adjustments[activeAdjTab][ctrl.key] + ctrl.suffix;
    }
  });
}

document
  .getElementById("tabGlobal")
  .addEventListener("click", () => switchAdjTab("global"));
document
  .getElementById("tabGradient")
  .addEventListener("click", () => switchAdjTab("gradient"));
document
  .getElementById("tabPattern")
  .addEventListener("click", () => switchAdjTab("pattern"));

adjControls.forEach((ctrl) => {
  document.getElementById(ctrl.id).addEventListener("input", (e) => {
    adjustments[activeAdjTab][ctrl.key] = parseInt(e.target.value, 10);
    document.getElementById(`adjVal${ctrl.id.substring(3)}`).textContent =
      e.target.value + ctrl.suffix;
    updateAllPreviews();
  });
});

document.getElementById("resetAdjustmentsBtn").addEventListener("click", () => {
  adjustments[activeAdjTab] = {
    hue: 0,
    saturation: 100,
    lightness: 100,
    brightness: 0,
    contrast: 100,
    highlights: 0,
    shadows: 0,
  };
  switchAdjTab(activeAdjTab);
  updateAllPreviews();
});

// Pattern Listeners
document.getElementById("patternFileInput").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      globalPattern.src = ev.target.result;
      const img = new Image();
      img.onload = () => {
        globalPattern.img = img;
        document.getElementById("patternPreviewImg").src = img.src;
        document.getElementById("patternPreviewImg").classList.remove("hidden");
        document.getElementById("patternPlaceholder").classList.add("hidden");
        updateAllPreviews();
      };
      img.src = globalPattern.src;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

document.getElementById("patternScaleW").addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  globalPattern.scaleW = isNaN(val) ? 100 : val;
  updateAllPreviews();
});

document.getElementById("patternScaleH").addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  globalPattern.scaleH = isNaN(val) ? 100 : val;
  updateAllPreviews();
});

document.getElementById("patternOpacity").addEventListener("input", (e) => {
  globalPattern.opacity = parseInt(e.target.value, 10);
  updateAllPreviews();
});

["patternBlend", "patternLayout"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    const key = id.replace("pattern", "");
    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
    globalPattern[lowerKey] = e.target.value;
    updateAllPreviews();
  });
});

function clearPatternUI() {
  globalPattern.src = null;
  globalPattern.img = null;
  document.getElementById("patternPreviewImg").src = "";
  document.getElementById("patternPreviewImg").classList.add("hidden");
  document.getElementById("patternPlaceholder").classList.remove("hidden");
  document.getElementById("patternFileInput").value = "";
  document.getElementById("patternScaleW").value = 100;
  document.getElementById("patternScaleH").value = 100;
  globalPattern.scaleW = 100;
  globalPattern.scaleH = 100;
  updateAllPreviews();
}

document
  .getElementById("clearPatternBtn")
  .addEventListener("click", clearPatternUI);

fileInput.addEventListener("change", (e) => {
  for (const file of e.target.files) {
    const reader = new FileReader();
    reader.onload = (e) => addImageToState(file.name, e.target.result);
    reader.readAsDataURL(file);
  }
});

function pushHistory() {
  const snapshot = JSON.stringify({
    imagesState,
    gradientStops,
    globalPattern: {
      ...globalPattern,
      img: null,
    },
    adjustments,
    uiState: {
      paletteReduce: uiState.paletteReduce,
      paletteColors: uiState.paletteColors,
      dithering: uiState.dithering,
    },
  });
  uiState.history.undo.push(snapshot);
  uiState.history.redo = [];
}

function restoreHistory(snapshot) {
  const state = JSON.parse(snapshot);
  imagesState = state.imagesState;
  gradientStops = state.gradientStops;
  adjustments = state.adjustments;
  uiState.paletteReduce = state.uiState.paletteReduce;
  uiState.paletteColors = state.uiState.paletteColors;
  uiState.dithering = state.uiState.dithering;

  renderAllImageCards();
  renderGradientBar();
  updateAllPreviews();
}

function undo() {
  if (uiState.history.undo.length === 0) return;
  const snapshot = uiState.history.undo.pop();
  uiState.history.redo.push(
    JSON.stringify({
      imagesState,
      gradientStops,
      globalPattern: {
        ...globalPattern,
        img: null,
      },
      adjustments,
      uiState: {
        paletteReduce: uiState.paletteReduce,
        paletteColors: uiState.paletteColors,
        dithering: uiState.dithering,
      },
    }),
  );
  restoreHistory(snapshot);
}

function redo() {
  if (uiState.history.redo.length === 0) return;
  const snapshot = uiState.history.redo.pop();
  uiState.history.undo.push(
    JSON.stringify({
      imagesState,
      gradientStops,
      globalPattern: {
        ...globalPattern,
        img: null,
      },
      adjustments,
      uiState: {
        paletteReduce: uiState.paletteReduce,
        paletteColors: uiState.paletteColors,
        dithering: uiState.dithering,
      },
    }),
  );
  restoreHistory(snapshot);
}

function addImageToState(name, src, baseSrc = null) {
  pushHistory();
  const obj = {
    id: "card_" + Date.now() + Math.random(),
    name,
    src,
    baseSrc,
    createdAt: Date.now(),
  };
  imagesState.push(obj);
  renderCard(obj);
  emptyState.classList.add("hidden");
  editorGrid.classList.remove("hidden");
  updatePreview(obj);
}

function sortImagesBy(criteria, newestFirst = false) {
  if (imagesState.length === 0) return;

  if (criteria === "name") {
    imagesState.sort((a, b) => {
      const result = a.name
        .toString()
        .localeCompare(b.name.toString(), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      return newestFirst ? -result : result;
    });
  } else if (criteria === "new") {
    imagesState.sort((a, b) =>
      newestFirst ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
    );
  }

  editorGrid.innerHTML = "";
  imagesState.forEach((obj) => renderCard(obj));

  const label =
    criteria === "name"
      ? newestFirst
        ? "Z → A"
        : "A → Z"
      : newestFirst
        ? "Newest first"
        : "Oldest first";
  showNotification(`Sorted ${label}`);
}

function renderCard(obj) {
  const template = document.getElementById("imageCardTemplate");
  const clone = template.content.cloneNode(true);
  const container = clone.querySelector(".image-card");
  container.id = `card-${obj.id}`;
  clone.querySelector(".preview-img").src = obj.src;
  const nameInput = clone.querySelector(".image-name");
  nameInput.value = obj.name;
  nameInput.onchange = (e) => {
    obj.name = e.target.value;
  };
  clone.querySelector(".download-btn").onclick = () => downloadImage(obj);
  clone.querySelector(".delete-btn").onclick = () => {
    deleteImage(obj.id);
  };
  clone.querySelector(".save-preset-btn").onclick = () =>
    saveImageAsPreset(obj);
  clone.querySelector(".add-base-btn").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          obj.baseSrc = ev.target.result;
          updatePreview(obj);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    input.click();
  };
  editorGrid.appendChild(clone);
}

function deleteImage(id) {
  imagesState = imagesState.filter((i) => i.id !== id);
  const el = document.getElementById(`card-${id}`);
  if (el) el.remove();
  if (imagesState.length === 0) emptyState.classList.remove("hidden");
  showNotification("Image deleted");
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getGradientColor(lum) {
  const sorted = [...gradientStops].sort((a, b) => a.pos - b.pos);
  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    if (lum >= s1.pos && lum <= s2.pos) {
      const t = (lum - s1.pos) / (s2.pos - s1.pos || 1e-6);
      const c1 = hexToRgb(s1.color);
      const c2 = hexToRgb(s2.color);
      return c1.map((v, idx) => Math.round(v + (c2[idx] - v) * t));
    }
  }
  return lum < 0.5
    ? hexToRgb(sorted[0].color)
    : hexToRgb(sorted[sorted.length - 1].color);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  h /= 360;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

function applyGradient(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const lum =
      (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const [r, g, b] = getGradientColor(lum);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyPattern(ctx, canvasWidth, canvasHeight, patternAdj) {
  if (!globalPattern.img) return;

  // Save the current content to use as an alpha mask
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvasWidth;
  maskCanvas.height = canvasHeight;
  const maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(ctx.canvas, 0, 0);

  const patLayerCanvas = document.createElement("canvas");
  patLayerCanvas.width = canvasWidth;
  patLayerCanvas.height = canvasHeight;
  const pCtx = patLayerCanvas.getContext("2d");
  pCtx.imageSmoothingEnabled = false;

  const scaleW = globalPattern.scaleW / 100;
  const scaleH = globalPattern.scaleH / 100;

  if (globalPattern.layout === "stretch") {
    const w = canvasWidth * scaleW;
    const h = canvasHeight * scaleH;
    const x = (canvasWidth - w) / 2;
    const y = (canvasHeight - h) / 2;
    pCtx.drawImage(globalPattern.img, x, y, w, h);
  } else if (globalPattern.layout === "center") {
    const w = globalPattern.img.naturalWidth * scaleW;
    const h = globalPattern.img.naturalHeight * scaleH;
    const x = (canvasWidth - w) / 2;
    const y = (canvasHeight - h) / 2;
    pCtx.drawImage(globalPattern.img, x, y, w, h);
  } else {
    // tile modes
    const isReverse = globalPattern.layout === "tile-reverse";
    const isFlip = globalPattern.layout === "tile-flip";

    // Use Math.round to avoid sub-pixel seams in mirrored patterns
    const w = Math.max(1, Math.round(globalPattern.img.naturalWidth * scaleW));
    const h = Math.max(1, Math.round(globalPattern.img.naturalHeight * scaleH));

    const tileCanvas = document.createElement("canvas");

    if (isReverse || isFlip) {
      tileCanvas.width = w * 2;
      tileCanvas.height = h * 2;
      const tCtx = tileCanvas.getContext("2d");
      tCtx.imageSmoothingEnabled = false;

      const drawFlipped = (img, x, y, flipX, flipY) => {
        tCtx.save();
        tCtx.translate(x + (flipX ? w : 0), y + (flipY ? h : 0));
        tCtx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        tCtx.drawImage(img, 0, 0, w, h);
        tCtx.restore();
      };

      if (isFlip) {
        drawFlipped(globalPattern.img, 0, 0, false, false); // TL
        drawFlipped(globalPattern.img, w, 0, true, false); // TR
        drawFlipped(globalPattern.img, 0, h, false, true); // BL
        drawFlipped(globalPattern.img, w, h, true, true); // BR
      } else if (isReverse) {
        drawFlipped(globalPattern.img, 0, 0, true, true); // TL
        drawFlipped(globalPattern.img, w, 0, false, true); // TR
        drawFlipped(globalPattern.img, 0, h, true, false); // BL
        drawFlipped(globalPattern.img, w, h, false, false); // BR
      }
    } else {
      tileCanvas.width = w;
      tileCanvas.height = h;
      const tCtx = tileCanvas.getContext("2d");
      tCtx.imageSmoothingEnabled = false;
      tCtx.drawImage(globalPattern.img, 0, 0, w, h);
    }

    const pattern = pCtx.createPattern(tileCanvas, "repeat");
    pCtx.fillStyle = pattern;
    pCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Apply Pattern-specific Adjustments
  applyAdjustments(pCtx, canvasWidth, canvasHeight, patternAdj);

  // Clip the pattern strictly to the original pixels of this layer
  pCtx.globalCompositeOperation = "destination-in";
  pCtx.drawImage(maskCanvas, 0, 0);

  ctx.save();
  ctx.globalAlpha = globalPattern.opacity / 100;
  ctx.globalCompositeOperation = globalPattern.blend;
  ctx.drawImage(patLayerCanvas, 0, 0);
  ctx.restore();
}

function applyAdjustments(ctx, width, height, adj) {
  if (!adj) return;
  if (
    adj.hue === 0 &&
    adj.saturation === 100 &&
    adj.lightness === 100 &&
    adj.brightness === 0 &&
    adj.contrast === 100 &&
    adj.highlights === 0 &&
    adj.shadows === 0
  )
    return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const hue = adj.hue;
  const sat = adj.saturation / 100;
  const lit = adj.lightness / 100;
  const bri = adj.brightness;
  const con = adj.contrast / 100;
  const high = adj.highlights;
  const shad = adj.shadows;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip transparent pixels

    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // 1. HSL Adjustments
    if (hue !== 0 || sat !== 1 || lit !== 1) {
      let [h, s, l] = rgbToHsl(r, g, b);
      h = (h + hue + 360) % 360;
      s = Math.max(0, Math.min(1, s * sat));
      l = Math.max(0, Math.min(1, l * lit));
      [r, g, b] = hslToRgb(h, s, l);
    }

    // 2. Brightness & Contrast
    if (bri !== 0 || con !== 1) {
      r = (r - 128) * con + 128 + bri;
      g = (g - 128) * con + 128 + bri;
      b = (b - 128) * con + 128 + bri;
    }

    // 3. Highlights & Shadows
    if (high !== 0 || shad !== 0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let rAdjust = 0,
        gAdjust = 0,
        bAdjust = 0;

      if (shad !== 0 && lum < 128) {
        const weight = (128 - lum) / 128; // 1 at pure black, 0 at mid-gray
        const shift = shad * weight;
        rAdjust += shift;
        gAdjust += shift;
        bAdjust += shift;
      }

      if (high !== 0 && lum > 128) {
        const weight = (lum - 128) / 127; // 0 at mid-gray, 1 at pure white
        const shift = high * weight;
        rAdjust += shift;
        gAdjust += shift;
        bAdjust += shift;
      }

      r += rAdjust;
      g += gAdjust;
      b += bAdjust;
    }

    // Clamp values between 0 and 255
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imgData, 0, 0);
}

function updatePreview(obj) {
  const el = document.getElementById(`card-${obj.id}`);
  if (!el) return;
  const canvas = document.createElement("canvas");
  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    if (obj.baseSrc) {
      const base = new Image();
      base.onload = () => {
        ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

        applyGradient(tempCtx, canvas.width, canvas.height);
        applyAdjustments(
          tempCtx,
          canvas.width,
          canvas.height,
          adjustments.gradient,
        );

        applyPattern(tempCtx, canvas.width, canvas.height, adjustments.pattern);
        applyAdjustments(
          tempCtx,
          canvas.width,
          canvas.height,
          adjustments.global,
        );

        ctx.drawImage(tempCanvas, 0, 0);
        el.querySelector(".preview-img").src = canvas.toDataURL("image/png");
      };
      base.src = obj.baseSrc;
    } else {
      ctx.drawImage(img, 0, 0);

      applyGradient(ctx, canvas.width, canvas.height);
      applyAdjustments(ctx, canvas.width, canvas.height, adjustments.gradient);

      applyPattern(ctx, canvas.width, canvas.height, adjustments.pattern);
      applyAdjustments(ctx, canvas.width, canvas.height, adjustments.global);

      el.querySelector(".preview-img").src = canvas.toDataURL("image/png");
    }
  };
  img.src = obj.src;
}

function updateAllPreviews() {
  imagesState.forEach(updatePreview);
}

function getExportTextureSize() {
  if (!exportSizeSelect) return null;
  const selected = exportSizeSelect.value;
  return selected === "original" ? null : parseInt(selected, 10);
}

function getProcessedImage(obj) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const finalize = () => {
        const textureSize = getExportTextureSize();
        if (textureSize) {
          const scaled = document.createElement("canvas");
          scaled.width = textureSize;
          scaled.height = textureSize;
          const scaledCtx = scaled.getContext("2d");
          scaledCtx.imageSmoothingEnabled = false;
          scaledCtx.clearRect(0, 0, textureSize, textureSize);
          scaledCtx.drawImage(canvas, 0, 0, textureSize, textureSize);
          resolve(scaled.toDataURL("image/png"));
        } else {
          resolve(canvas.toDataURL("image/png"));
        }
      };

      if (obj.baseSrc) {
        const base = new Image();
        base.onload = () => {
          ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext("2d");
          tempCtx.imageSmoothingEnabled = false;
          tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

          applyGradient(tempCtx, canvas.width, canvas.height);
          applyAdjustments(
            tempCtx,
            canvas.width,
            canvas.height,
            adjustments.gradient,
          );

          applyPattern(
            tempCtx,
            canvas.width,
            canvas.height,
            adjustments.pattern,
          );
          applyAdjustments(
            tempCtx,
            canvas.width,
            canvas.height,
            adjustments.global,
          );

          ctx.drawImage(tempCanvas, 0, 0);
          finalize();
        };
        base.src = obj.baseSrc;
      } else {
        ctx.drawImage(img, 0, 0);

        applyGradient(ctx, canvas.width, canvas.height);
        applyAdjustments(
          ctx,
          canvas.width,
          canvas.height,
          adjustments.gradient,
        );

        applyPattern(ctx, canvas.width, canvas.height, adjustments.pattern);
        applyAdjustments(ctx, canvas.width, canvas.height, adjustments.global);

        finalize();
      }
    };
    img.src = obj.src;
  });
}

async function downloadImage(obj) {
  let rawPrefix = document.getElementById("prefixInput").value.trim();
  let imgPrefix = rawPrefix
    ? rawPrefix.endsWith("_")
      ? rawPrefix
      : rawPrefix + "_"
    : "tonal_";

  const dataUrl = await getProcessedImage(obj);
  const a = document.createElement("a");
  let fileName = `${imgPrefix}${obj.name}`;
  if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";
  a.download = fileName;
  a.href = dataUrl;
  a.click();
  showNotification(`Downloaded ${fileName}`);
}

async function downloadTexturePack() {
  if (imagesState.length === 0) return;

  let rawPrefix = document.getElementById("prefixInput").value.trim();
  let packName = rawPrefix
    ? rawPrefix.replace(/[^a-z0-9_]/gi, "_").toLowerCase()
    : "minecraft_texture_pack";
  const zip = new JSZip();
  zip.file(
    "pack.mcmeta",
    JSON.stringify(
      { pack: { pack_format: 8, description: "Created by Bulk Tonal Studio" } },
      null,
      2,
    ),
  );
  const assetsPath = "assets/minecraft/textures/blocks/";

  for (const obj of imagesState) {
    const dataUrl = await getProcessedImage(obj);
    const base64Data = dataUrl.split(",")[1];
    let fileName = obj.name.toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
    if (!fileName.endsWith(".png")) fileName += ".png";
    zip.file(`${assetsPath}${fileName}`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = `${packName}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
  showNotification("Texture pack downloaded!");
}

document
  .getElementById("downloadAllBtn")
  .addEventListener("click", async () => {
    if (imagesState.length === 0) return;

    const btn = document.getElementById("downloadAllBtn");
    const originalText = btn.textContent;
    btn.textContent = "Zipping...";
    btn.disabled = true;

    let rawPrefix = document.getElementById("prefixInput").value.trim();
    let imgPrefix = rawPrefix
      ? rawPrefix.endsWith("_")
        ? rawPrefix
        : rawPrefix + "_"
      : "tonal_";
    let zipName = rawPrefix ? `${rawPrefix}.zip` : "Bulk_Tonal_Export.zip";

    const zip = new JSZip();

    for (const obj of imagesState) {
      const dataUrl = await getProcessedImage(obj);
      const base64Data = dataUrl.split(",")[1];
      let fileName = `${imgPrefix}${obj.name}`;
      if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";
      zip.file(fileName, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = zipName;
    a.click();
    URL.revokeObjectURL(a.href);

    btn.textContent = originalText;
    btn.disabled = false;
    showNotification("All images exported!");
  });

function saveImageAsPreset(obj) {
  const presets = JSON.parse(localStorage.getItem("tonal_presets") || "[]");
  const patternStateToSave = globalPattern.src
    ? {
        src: globalPattern.src,
        scaleW: globalPattern.scaleW,
        scaleH: globalPattern.scaleH,
        opacity: globalPattern.opacity,
        blend: globalPattern.blend,
        layout: globalPattern.layout,
      }
    : null;
  presets.push({
    type: "preset",
    id: "p_" + Date.now(),
    folderId: null,
    name: obj.name,
    gradientStops,
    images: [obj],
    pattern: patternStateToSave,
    adjustments: JSON.parse(JSON.stringify(adjustments)),
  });
  localStorage.setItem("tonal_presets", JSON.stringify(presets));
  showNotification("Preset saved!");
}

function renderPresets() {
  const list = document.getElementById("presetsList");
  list.innerHTML = "";
  let presets = JSON.parse(localStorage.getItem("tonal_presets") || "[]");

  // Migration for old flat presets
  let migrated = false;
  presets = presets.map((p) => {
    if (!p.type) {
      migrated = true;
      return {
        type: "preset",
        id: "p_" + Math.random().toString(36).substr(2, 9),
        folderId: null,
        ...p,
      };
    }
    return p;
  });
  if (migrated) localStorage.setItem("tonal_presets", JSON.stringify(presets));

  const folders = presets.filter((p) => p.type === "folder");
  const allPresets = presets.filter((p) => p.type === "preset");
  let draggedId = null;

  function handleDragStart(e, id) {
    draggedId = id;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => e.target.classList.add("opacity-40"), 0);
  }
  function handleDragEnd(e) {
    e.target.classList.remove("opacity-40");
    draggedId = null;
    document
      .querySelectorAll(".drop-target")
      .forEach((el) =>
        el.classList.remove("border-indigo-500", "bg-indigo-50"),
      );
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("border-indigo-500", "bg-indigo-50");
  }
  function handleDragLeave(e) {
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
  }
  function handleDrop(e, targetItem) {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
    if (!draggedId || draggedId === targetItem.id) return;

    const draggedIndex = presets.findIndex((p) => p.id === draggedId);
    const targetIndex = presets.findIndex((p) => p.id === targetItem.id);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const draggedItem = presets[draggedIndex];

    if (targetItem.type === "folder" && draggedItem.type === "preset") {
      // Move preset into the folder
      draggedItem.folderId = targetItem.id;
      targetItem.isOpen = true;
      const item = presets.splice(draggedIndex, 1)[0];
      presets.push(item);
    } else if (targetItem.type === "preset" && draggedItem.type === "preset") {
      // Reorder presets
      draggedItem.folderId = targetItem.folderId; // Inherit folder location
      const item = presets.splice(draggedIndex, 1)[0];
      const newTargetIndex = presets.findIndex((p) => p.id === targetItem.id);
      presets.splice(newTargetIndex, 0, item);
    } else if (targetItem.type === "folder" && draggedItem.type === "folder") {
      // Reorder folders
      const item = presets.splice(draggedIndex, 1)[0];
      const newTargetIndex = presets.findIndex((p) => p.id === targetItem.id);
      presets.splice(newTargetIndex, 0, item);
    }

    localStorage.setItem("tonal_presets", JSON.stringify(presets));
    renderPresets();
  }

  // Render Folders
  folders.forEach((folder) => {
    const folderDiv = document.createElement("div");
    folderDiv.className =
      "folder-item flex justify-between items-center p-2 bg-gray-200 border border-gray-300 rounded text-sm mb-2 font-semibold text-gray-800 drop-target transition-colors";

    const iconHtml =
      folder.icon && folder.icon.startsWith("data:image/")
        ? `<img src="${folder.icon}" class="w-4 h-4 shrink-0 object-contain rounded-sm">`
        : `<i data-lucide="${folder.icon || "folder"}" class="w-4 h-4 text-indigo-600 shrink-0"></i>`;

    folderDiv.innerHTML = `
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="drag-handle-folder text-gray-400 text-lg select-none cursor-grab active:cursor-grabbing px-1 hover:text-gray-600 transition-colors">⋮⋮</span>
                        <div class="flex items-center gap-2 cursor-pointer flex-1 toggle-folder truncate">
                            <i data-lucide="${folder.isOpen ? "chevron-down" : "chevron-right"}" class="w-4 h-4 text-gray-600 shrink-0"></i>
                            ${iconHtml}
                            <span class="truncate">${folder.name}</span>
                        </div>
                    </div>
                    <button class="delete-folder-btn px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs transition shrink-0 ml-2">Delete</button>
                `;

    const handle = folderDiv.querySelector(".drag-handle-folder");
    handle.addEventListener("mousedown", () => (folderDiv.draggable = true));
    handle.addEventListener("mouseup", () => (folderDiv.draggable = false));
    handle.addEventListener("mouseleave", () => (folderDiv.draggable = false));

    folderDiv.querySelector(".toggle-folder").onclick = () => {
      folder.isOpen = !folder.isOpen;
      localStorage.setItem("tonal_presets", JSON.stringify(presets));
      renderPresets();
    };

    folderDiv.querySelector(".delete-folder-btn").onclick = () => {
      // Delete folder and move its contents to root
      presets = presets.filter((p) => p.id !== folder.id);
      presets.forEach((p) => {
        if (p.folderId === folder.id) p.folderId = null;
      });
      localStorage.setItem("tonal_presets", JSON.stringify(presets));
      renderPresets();
      showNotification("Folder deleted");
    };

    folderDiv.addEventListener("dragstart", (e) =>
      handleDragStart(e, folder.id),
    );
    folderDiv.addEventListener("dragend", handleDragEnd);
    folderDiv.addEventListener("dragover", handleDragOver);
    folderDiv.addEventListener("dragleave", handleDragLeave);
    folderDiv.addEventListener("drop", (e) => handleDrop(e, folder));

    list.appendChild(folderDiv);

    // Render presets inside this folder immediately beneath it
    if (folder.isOpen) {
      const childPresets = allPresets.filter((p) => p.folderId === folder.id);
      childPresets.forEach((p) => renderPresetRow(p, true));
    }
  });

  // Render Root Presets
  const rootPresets = allPresets.filter((p) => !p.folderId);
  if (folders.length > 0 && rootPresets.length > 0) {
    const divider = document.createElement("div");
    divider.className = "h-px bg-gray-200 my-4";
    list.appendChild(divider);
  }
  rootPresets.forEach((p) => renderPresetRow(p, false));

  function renderPresetRow(p, isIndented) {
    const div = document.createElement("div");
    div.className = `preset-item flex justify-between items-center p-2 border border-gray-200 rounded text-sm bg-gray-50 transition-colors drop-target ${isIndented ? "ml-6 mb-1" : "mb-2"}`;

    const imgData = p.images[0];
    const previewHtml = imgData.baseSrc
      ? `<div class="relative w-10 h-10 border rounded bg-white overflow-hidden pointer-events-none">
                         <img src="${imgData.baseSrc}" class="absolute inset-0 w-full h-full object-contain preview-img">
                         <img src="${imgData.src}" class="absolute inset-0 w-full h-full object-contain preview-img">
                       </div>`
      : `<img src="${imgData.src}" class="w-10 h-10 object-contain border rounded bg-white preview-img pointer-events-none">`;

    div.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="drag-handle text-gray-400 text-lg select-none cursor-grab active:cursor-grabbing px-1 hover:text-gray-600 transition-colors">⋮⋮</span>
                        ${previewHtml}
                        <span class="font-medium text-gray-800 pointer-events-none">${p.name}</span>
                    </div>
                    <div class="flex gap-2">
                        <button class="load-btn px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">Load</button>
                        <button class="delete-btn px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Delete</button>
                    </div>
                `;

    const handle = div.querySelector(".drag-handle");
    handle.addEventListener("mousedown", () => (div.draggable = true));
    handle.addEventListener("mouseup", () => (div.draggable = false));
    handle.addEventListener("mouseleave", () => (div.draggable = false));

    div.querySelector(".load-btn").onclick = () => {
      p.images.forEach((imgObj) =>
        addImageToState(imgObj.name, imgObj.src, imgObj.baseSrc),
      );
      gradientStops = [...p.gradientStops];
      renderGradientBar();

      if (p.pattern) {
        globalPattern = { ...p.pattern, img: null };
        document.getElementById("patternScaleW").value = p.pattern.scaleW;
        document.getElementById("patternScaleH").value = p.pattern.scaleH;
        document.getElementById("patternOpacity").value = p.pattern.opacity;
        document.getElementById("patternBlend").value = p.pattern.blend;
        document.getElementById("patternLayout").value = p.pattern.layout;

        if (p.pattern.src) {
          const img = new Image();
          img.onload = () => {
            globalPattern.img = img;
            document.getElementById("patternPreviewImg").src = img.src;
            document
              .getElementById("patternPreviewImg")
              .classList.remove("hidden");
            document
              .getElementById("patternPlaceholder")
              .classList.add("hidden");
            updateAllPreviews();
          };
          img.src = p.pattern.src;
        } else {
          clearPatternUI();
        }
      } else {
        clearPatternUI();
      }

      if (p.adjustments) {
        if (p.adjustments.global) {
          adjustments = JSON.parse(JSON.stringify(p.adjustments));
        } else {
          adjustments = {
            global: { ...p.adjustments },
            gradient: {
              hue: 0,
              saturation: 100,
              lightness: 100,
              brightness: 0,
              contrast: 100,
              highlights: 0,
              shadows: 0,
            },
            pattern: {
              hue: 0,
              saturation: 100,
              lightness: 100,
              brightness: 0,
              contrast: 100,
              highlights: 0,
              shadows: 0,
            },
          };
        }
      } else {
        adjustments = {
          global: {
            hue: 0,
            saturation: 100,
            lightness: 100,
            brightness: 0,
            contrast: 100,
            highlights: 0,
            shadows: 0,
          },
          gradient: {
            hue: 0,
            saturation: 100,
            lightness: 100,
            brightness: 0,
            contrast: 100,
            highlights: 0,
            shadows: 0,
          },
          pattern: {
            hue: 0,
            saturation: 100,
            lightness: 100,
            brightness: 0,
            contrast: 100,
            highlights: 0,
            shadows: 0,
          },
        };
      }
      switchAdjTab(activeAdjTab);

      showNotification("Preset loaded");
    };

    div.querySelector(".delete-btn").onclick = () => {
      presets = presets.filter((item) => item.id !== p.id);
      localStorage.setItem("tonal_presets", JSON.stringify(presets));
      renderPresets();
      showNotification("Preset deleted");
    };

    div.addEventListener("dragstart", (e) => handleDragStart(e, p.id));
    div.addEventListener("dragend", handleDragEnd);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("dragleave", handleDragLeave);
    div.addEventListener("drop", (e) => handleDrop(e, p));

    list.appendChild(div);
  }

  // Empty zone to drop a preset back to the Root level
  const rootDropZone = document.createElement("div");
  rootDropZone.className =
    "p-4 mt-2 border-2 border-dashed border-gray-200 rounded text-center text-gray-400 text-xs hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default drop-target";
  rootDropZone.textContent = "Drag presets here to move to Root";
  rootDropZone.addEventListener("dragover", handleDragOver);
  rootDropZone.addEventListener("dragleave", handleDragLeave);
  rootDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
    if (!draggedId) return;
    const draggedIndex = presets.findIndex((p) => p.id === draggedId);
    if (draggedIndex !== -1 && presets[draggedIndex].type === "preset") {
      presets[draggedIndex].folderId = null;
      const item = presets.splice(draggedIndex, 1)[0];
      presets.push(item);
      localStorage.setItem("tonal_presets", JSON.stringify(presets));
      renderPresets();
    }
  });
  list.appendChild(rootDropZone);

  lucide.createIcons();
}

document.getElementById("openPresetsBtn").addEventListener("click", () => {
  renderPresets();
  document.getElementById("presetsModal").showModal();
});

document.getElementById("saveCurrentStateBtn").addEventListener("click", () => {
  const name = prompt("Name your preset:");
  if (name) {
    const presets = JSON.parse(localStorage.getItem("tonal_presets") || "[]");
    const patternStateToSave = globalPattern.src
      ? {
          src: globalPattern.src,
          scaleW: globalPattern.scaleW,
          scaleH: globalPattern.scaleH,
          opacity: globalPattern.opacity,
          blend: globalPattern.blend,
          layout: globalPattern.layout,
        }
      : null;
    presets.push({
      type: "preset",
      id: "p_" + Date.now(),
      folderId: null,
      name,
      gradientStops,
      images: imagesState,
      pattern: patternStateToSave,
      adjustments: JSON.parse(JSON.stringify(adjustments)),
    });
    localStorage.setItem("tonal_presets", JSON.stringify(presets));
    renderPresets(); // Update the list visually right away
    showNotification("Session saved!");
  }
});

document
  .getElementById("exportPresetsBtn")
  .addEventListener("click", async () => {
    const btn = document.getElementById("exportPresetsBtn");
    const presetsStr = localStorage.getItem("tonal_presets");

    if (!presetsStr || presetsStr === "[]") {
      const originalText = btn.textContent;
      btn.textContent = "Empty!";
      setTimeout(() => (btn.textContent = originalText), 2000);
      return;
    }

    const originalText = btn.textContent;
    btn.textContent = "Zipping...";
    btn.disabled = true;

    try {
      const zip = new JSZip();
      zip.file("tonal_presets.json", presetsStr);
      const content = await zip.generateAsync({ type: "blob" });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "Tonal_Presets_Backup.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      showNotification("Presets exported!");
    } catch (err) {
      console.error("Export error:", err);
      showNotification("Export failed");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

document
  .getElementById("importPresetsInput")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      const presetsFile = zip.file("tonal_presets.json");

      if (!presetsFile) {
        console.error(
          "Invalid backup file. Could not find tonal_presets.json inside the ZIP.",
        );
        return;
      }

      const content = await presetsFile.async("string");
      const importedPresets = JSON.parse(content);

      if (Array.isArray(importedPresets)) {
        const existingPresets = JSON.parse(
          localStorage.getItem("tonal_presets") || "[]",
        );
        // Append imported presets to existing ones so nothing is lost
        const merged = [...existingPresets, ...importedPresets];
        localStorage.setItem("tonal_presets", JSON.stringify(merged));
        renderPresets();
        showNotification("Presets imported!");
      }
      e.target.value = ""; // Reset the file input
    } catch (err) {
      console.error("Error importing presets:", err);
      showNotification("Import failed");
    }
  });

// Folder Icon Setup
let selectedFolderIcon = "folder";
const iconGrid = document.getElementById("iconSelection");
const folderIcons = [
  "folder",
  "star",
  "image",
  "users",
  "box",
  "sun",
  "moon",
  "palette",
  "zap",
  "heart",
];

folderIcons.forEach((icon) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `icon-btn p-2 rounded-lg border-2 transition-all ${icon === "folder" ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-transparent text-gray-500 hover:bg-gray-100"}`;
  btn.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 pointer-events-none"></i>`;
  btn.onclick = () => {
    selectedFolderIcon = icon;
    document.querySelectorAll(".icon-btn").forEach((b) => {
      b.className = `icon-btn p-2 rounded-lg border-2 transition-all border-transparent text-gray-500 hover:bg-gray-100`;
    });
    btn.className = `icon-btn p-2 rounded-lg border-2 transition-all border-indigo-500 bg-indigo-50 text-indigo-600`;
  };
  iconGrid.appendChild(btn);
});
lucide.createIcons();

document.getElementById("customIconInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64Src = ev.target.result;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `icon-btn p-2 rounded-lg border-2 transition-all border-indigo-500 bg-indigo-50 text-indigo-600`;
    btn.innerHTML = `<img src="${base64Src}" class="w-5 h-5 object-contain pointer-events-none rounded-sm">`;

    btn.onclick = () => {
      selectedFolderIcon = base64Src;
      document.querySelectorAll(".icon-btn").forEach((b) => {
        b.className = `icon-btn p-2 rounded-lg border-2 transition-all border-transparent text-gray-500 hover:bg-gray-100`;
      });
      btn.className = `icon-btn p-2 rounded-lg border-2 transition-all border-indigo-500 bg-indigo-50 text-indigo-600`;
    };

    // Auto-select the newly uploaded icon
    selectedFolderIcon = base64Src;
    document.querySelectorAll(".icon-btn").forEach((b) => {
      b.className = `icon-btn p-2 rounded-lg border-2 transition-all border-transparent text-gray-500 hover:bg-gray-100`;
    });
    iconGrid.appendChild(btn);

    e.target.value = ""; // Reset input
  };
  reader.readAsDataURL(file);
});

document.getElementById("openFolderModalBtn").addEventListener("click", () => {
  document.getElementById("folderNameInput").value = "";

  // Reset to the default folder icon when opening
  const firstIcon = document.querySelector(".icon-btn");
  if (firstIcon) firstIcon.click();

  document.getElementById("folderModal").showModal();
});

document.getElementById("createFolderBtn").addEventListener("click", () => {
  const name = document.getElementById("folderNameInput").value.trim();
  if (!name) return;
  const presets = JSON.parse(localStorage.getItem("tonal_presets") || "[]");
  presets.push({
    type: "folder",
    id: "f_" + Date.now() + Math.random(),
    name,
    icon: selectedFolderIcon,
    isOpen: true,
  });
  localStorage.setItem("tonal_presets", JSON.stringify(presets));
  document.getElementById("folderModal").close();
  renderPresets();
  showNotification("Folder created");
});
