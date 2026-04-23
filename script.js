const STORAGE_KEY = "hint-trap-progress-v1";
const stages = globalThis.HINT_TRAP_STAGES || [];

if (!stages.length) {
  throw new Error("Hint Trap levels failed to load. Include levels.js before script.js.");
}

const refs = {
  stageChip: document.getElementById("stage-chip"),
  tagChip: document.getElementById("tag-chip"),
  progressChip: document.getElementById("progress-chip"),
  stageTitle: document.getElementById("stage-title"),
  stageSubtitle: document.getElementById("stage-subtitle"),
  attemptCount: document.getElementById("attempt-count"),
  hintCount: document.getElementById("hint-count"),
  promptText: document.getElementById("prompt-text"),
  mechanicChip: document.getElementById("mechanic-chip"),
  hintBox: document.getElementById("hint-box"),
  hintText: document.getElementById("hint-text"),
  board: document.getElementById("board"),
  hintButton: document.getElementById("hint-button"),
  hintPassButton: document.getElementById("hint-pass-button"),
  skipButton: document.getElementById("skip-button"),
  retryButton: document.getElementById("retry-button"),
  nextButton: document.getElementById("next-button"),
  feedback: document.getElementById("feedback"),
  stageGrid: document.getElementById("stage-grid"),
  stageSummary: document.getElementById("stage-summary"),
  completeCopy: document.getElementById("complete-copy")
};

let progress = loadProgress();
let stageState = createStageState(0);
let dragState = null;
let shakeTimer = null;
let holdState = null;

refs.hintButton.addEventListener("click", revealHint);
refs.hintPassButton.addEventListener("click", useHintPass);
refs.skipButton.addEventListener("click", skipStage);
refs.retryButton.addEventListener("click", resetStage);
refs.nextButton.addEventListener("click", goToNextStage);
refs.stageChip.addEventListener("click", handleMetaTap);

goToStage(0);

function createStageState(index) {
  return {
    index,
    attempts: 0,
    hintShown: false,
    hintCount: 0,
    solved: false,
    revealed: false,
    foundIds: new Set(),
    sequenceIndex: 0,
    armedPromptWord: null,
    itemOffsets: {},
    holdScale: 1
  };
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const solvedIds = Array.isArray(parsed.solvedIds)
      ? parsed.solvedIds.filter((id) => stages.some((stage) => stage.id === id))
      : [];
    const skippedIds = Array.isArray(parsed.skippedIds)
      ? parsed.skippedIds.filter((id) => stages.some((stage) => stage.id === id) && !solvedIds.includes(id))
      : [];
    let contiguousSolvedCount = 0;
    while (
      contiguousSolvedCount < stages.length &&
      solvedIds.includes(stages[contiguousSolvedCount].id)
    ) {
      contiguousSolvedCount += 1;
    }

    const progressUnlocked = Math.min(stages.length, contiguousSolvedCount + 1);
    const highestUnlocked = clamp(Math.max(parsed.highestUnlocked || 1, progressUnlocked), 1, stages.length);

    return {
      solvedIds,
      skippedIds,
      highestUnlocked
    };
  } catch (error) {
    return {
      solvedIds: [],
      skippedIds: [],
      highestUnlocked: 1
    };
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    // Ignore storage failures in restricted contexts.
  }
}

function goToStage(index) {
  cleanupDrag();
  cleanupHold(false);

  const safeIndex = clamp(index, 0, stages.length - 1);
  const unlockedIndex = progress.highestUnlocked - 1;
  const targetIndex = Math.min(safeIndex, unlockedIndex);
  stageState = createStageState(targetIndex);
  stageState.solved = progress.solvedIds.includes(stages[targetIndex].id);
  refs.feedback.textContent = stageState.solved
    ? "Stage already solved. Use retry if you want to replay the trick."
    : "The trick is always on the page somewhere.";
  renderStage();
}

function resetStage() {
  const currentIndex = stageState.index;
  cleanupDrag();
  cleanupHold(false);
  stageState = createStageState(currentIndex);
  refs.feedback.textContent = "Stage reset. Read the page again and look for the trick.";
  renderStage();
}

function getStage() {
  return stages[stageState.index];
}

function renderStage() {
  const stage = getStage();
  const solvedCount = progress.solvedIds.length;
  const skippedCount = progress.skippedIds.length;

  refs.stageChip.textContent = `${stageState.index + 1} / ${stages.length}`;
  refs.tagChip.textContent = stage.tag;
  refs.progressChip.textContent = skippedCount
    ? `${solvedCount} Solved • ${skippedCount} Skipped`
    : `${solvedCount} Solved`;
  refs.stageTitle.textContent = stage.title;
  refs.stageSubtitle.textContent = stage.subtitle;
  refs.attemptCount.textContent = String(stageState.attempts);
  refs.hintCount.textContent = String(stageState.hintCount);
  refs.promptText.innerHTML = stage.promptHtml;
  refs.mechanicChip.textContent = stage.mechanic;
  refs.hintText.textContent = stage.hint;
  refs.hintBox.hidden = !stageState.hintShown;
  refs.board.dataset.theme = stage.theme;
  refs.stageSummary.textContent = `Stage ${stageState.index + 1} of ${stages.length}`;
  refs.completeCopy.textContent =
    solvedCount === stages.length
      ? `All ${stages.length} stages solved. Every trick in the set is open.`
      : `${solvedCount} of ${stages.length} stages cleared. ${
          stages.length - solvedCount
        } still waiting for you.${skippedCount ? ` ${skippedCount} skipped for later review.` : ""}`;
  refs.hintPassButton.disabled = stageState.solved || !stageState.hintShown;
  refs.skipButton.disabled = stageState.solved || stageState.index === stages.length - 1;
  refs.nextButton.disabled = !stageState.solved || stageState.index === stages.length - 1;

  if (!stageState.solved && !refs.feedback.textContent) {
    refs.feedback.textContent = "The trick is always on the page somewhere.";
  }

  bindPromptWords();
  renderBoard();
  renderStageGrid();
}

function clearArmedPromptWord() {
  stageState.armedPromptWord = null;
  refs.promptText.querySelectorAll(".prompt-word.is-armed").forEach((node) => {
    node.classList.remove("is-armed");
  });
  refs.board.querySelectorAll(".board-item.is-armed").forEach((node) => {
    node.classList.remove("is-armed");
  });
}

function renderStageGrid() {
  refs.stageGrid.replaceChildren();

  stages.forEach((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stage-dot";
    button.textContent = String(index + 1);
    button.dataset.index = String(index);
    button.classList.toggle("is-current", index === stageState.index);
    button.classList.toggle("is-complete", progress.solvedIds.includes(stage.id));
    button.classList.toggle("is-skipped", progress.skippedIds.includes(stage.id));
    button.classList.toggle("is-locked", index >= progress.highestUnlocked);
    button.disabled = index >= progress.highestUnlocked;
    button.addEventListener("click", () => goToStage(index));
    refs.stageGrid.append(button);
  });
}

function bindPromptWords() {
  refs.promptText.querySelectorAll("[data-tap-word]").forEach((node) => {
    node.addEventListener("click", () => handlePromptTap(node.dataset.tapWord));
  });

  refs.promptText.querySelectorAll("[data-drag-word]").forEach((node) => {
    node.classList.toggle("is-armed", stageState.armedPromptWord === node.dataset.dragWord);
    node.addEventListener("click", () => armPromptWord(node.dataset.dragWord, node.textContent));
    node.addEventListener("pointerdown", (event) =>
      startPromptWordDrag(event, node.dataset.dragWord, node.textContent)
    );
  });
}

function renderBoard() {
  const stage = getStage();
  refs.board.replaceChildren();

  stage.items.forEach((item) => {
    const visible = isItemVisible(item);
    const element = document.createElement(
      item.interactive || item.draggable || item.acceptWord || item.acceptItem ? "button" : "div"
    );

    if (element.tagName === "BUTTON") {
      element.type = "button";
    }

    element.className = "board-item";
    element.dataset.itemId = item.id;
    element.dataset.shape = item.shape || "card";
    element.dataset.tone = item.tone || "slate";
    element.setAttribute("aria-label", item.ariaLabel || item.text || item.imageAlt || item.id);

    if (item.image) {
      element.classList.add("has-image");
    }

    if (item.acceptWord) {
      element.dataset.acceptWord = item.acceptWord;
    }

    if (item.acceptItem) {
      element.dataset.acceptItem = item.acceptItem;
    }

    if (!visible) {
      element.classList.add("is-hidden");
    }

    if (stageState.foundIds.has(item.id)) {
      element.classList.add("is-found");
    }

    element.style.left = `${item.x}%`;
    element.style.top = `${item.y}%`;
    element.style.width = `${item.w}%`;
    element.style.height = `${item.h}%`;

    if (item.fontSize) {
      element.style.fontSize = item.fontSize;
    }

    if (item.imageSize) {
      element.style.setProperty("--image-size", item.imageSize);
    }

    if (item.flipX) {
      element.style.setProperty("--flip-x", "-1");
    }

    const offset = stageState.itemOffsets[item.id];
    if (offset) {
      element.style.setProperty("--drag-x", `${offset.x}px`);
      element.style.setProperty("--drag-y", `${offset.y}px`);
    }

    if (getStage().solution.kind === "hold" && item.id === getStage().solution.target) {
      element.style.setProperty("--item-scale", String(stageState.holdScale));
    }

    if (item.image) {
      const image = document.createElement("img");
      image.className = "board-image";
      image.src = item.image;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;
      image.addEventListener("error", () => {
        image.remove();

        if (item.icon && !element.querySelector(".board-icon")) {
          const icon = createBoardIcon(item.icon);
          element.prepend(icon);
        }
      });
      element.append(image);
    } else if (item.icon) {
      element.append(createBoardIcon(item.icon));
    }

    if (item.text) {
      const text = document.createElement("span");
      text.className = "board-text";
      text.textContent = item.text;
      element.append(text);
    }

    if (stageState.armedPromptWord && item.acceptWord === stageState.armedPromptWord) {
      element.classList.add("is-armed");
    }

    if (item.draggable) {
      element.addEventListener("pointerdown", (event) => startItemDrag(event, item));
    } else if (stage.solution.kind === "hold" && item.id === stage.solution.target) {
      element.addEventListener("pointerdown", (event) => startHold(event, item.id));
    } else if (item.interactive || item.acceptWord || item.acceptItem) {
      element.addEventListener("click", () => handleItemClick(item.id));
    }

    refs.board.append(element);
  });
}

function createBoardIcon(iconText) {
  const icon = document.createElement("span");
  icon.className = "board-icon";
  icon.textContent = iconText;
  return icon;
}

function isItemVisible(item) {
  if (item.hiddenUntilReveal && !stageState.revealed) {
    return false;
  }

  if (item.hideAfterReveal && stageState.revealed) {
    return false;
  }

  return true;
}

function handleItemClick(itemId) {
  const stage = getStage();
  const solution = stage.solution;

  if (stageState.solved) {
    return;
  }

  if (stageState.armedPromptWord) {
    registerAttempt();

    if (
      solution.kind === "dragPromptWord" &&
      stageState.armedPromptWord === solution.word &&
      itemId === solution.target
    ) {
      stageState.armedPromptWord = null;
      solveStage(stage.success);
      return;
    }

    stageState.armedPromptWord = null;
    renderStage();
    fail(stage.wrong);
    return;
  }

  registerAttempt();

  if (solution.kind === "tap") {
    if (itemId === solution.target) {
      solveStage(stage.success);
      return;
    }
  }

  if (solution.kind === "tapAny") {
    if (solution.targets.includes(itemId)) {
      solveStage(stage.success);
      return;
    }
  }

  if (solution.kind === "multi") {
    if (stageState.foundIds.has(itemId)) {
      return;
    }

    if (solution.targets.includes(itemId)) {
      stageState.foundIds.add(itemId);
      renderBoard();

      if (stageState.foundIds.size === solution.targets.length) {
        solveStage(stage.success);
      } else {
        refs.feedback.textContent = `${stageState.foundIds.size} of ${solution.targets.length} found.`;
      }
      return;
    }
  }

  if (solution.kind === "sequence") {
    if (stageState.foundIds.has(itemId)) {
      return;
    }

    const expectedId = solution.order[stageState.sequenceIndex];

    if (itemId === expectedId) {
      stageState.foundIds.add(itemId);
      stageState.sequenceIndex += 1;
      renderBoard();

      if (stageState.sequenceIndex === solution.order.length) {
        solveStage(stage.success);
      } else {
        refs.feedback.textContent = `Good. Keep moving upward.`;
      }
      return;
    }

    stageState.foundIds.clear();
    stageState.sequenceIndex = 0;
    renderBoard();
    fail(stage.wrong);
    return;
  }

  if (solution.kind === "revealTap") {
    if (!stageState.revealed) {
      fail(stage.wrong);
      return;
    }

    if (itemId === solution.target) {
      solveStage(stage.success);
      return;
    }
  }

  fail(stage.wrong);
}

function handlePromptTap(word) {
  const stage = getStage();

  if (stageState.solved) {
    return;
  }

  registerAttempt();

  if (stage.solution.kind === "promptTap" && stage.solution.word === word) {
    solveStage(stage.success);
    return;
  }

  fail(stage.wrong);
}

function handleMetaTap() {
  const stage = getStage();

  if (stageState.solved || stage.solution.kind !== "metaTap") {
    return;
  }

  registerAttempt();

  if (stage.solution.target === "stage-chip") {
    solveStage(stage.success);
    return;
  }

  fail(stage.wrong);
}

function revealHint() {
  if (stageState.solved) {
    refs.feedback.textContent = "This stage is already solved.";
    return;
  }

  if (stageState.hintShown) {
    refs.feedback.textContent = "Hint already open.";
    return;
  }

  stageState.hintShown = true;
  stageState.hintCount = 1;
  refs.hintBox.hidden = false;
  refs.hintCount.textContent = "1";
  refs.hintPassButton.disabled = false;
  refs.feedback.textContent = "Hint revealed. The page just got a little less stubborn.";
}

function useHintPass() {
  if (stageState.solved) {
    return;
  }

  if (!stageState.hintShown) {
    revealHint();
    return;
  }

  solveStage(`Hint pass used. ${getStage().success}`);
}

function registerAttempt() {
  stageState.attempts += 1;
  refs.attemptCount.textContent = String(stageState.attempts);
}

function armPromptWord(word, label) {
  if (stageState.solved) {
    return;
  }

  stageState.armedPromptWord = word;
  renderStage();
  refs.feedback.textContent = `"${label}" selected. Now tap the matching target on the board.`;
}

function solveStage(message) {
  const stage = getStage();

  stageState.solved = true;
  refs.feedback.textContent = message;

  if (!progress.solvedIds.includes(stage.id)) {
    progress.solvedIds = [...progress.solvedIds, stage.id];
  }

  progress.skippedIds = progress.skippedIds.filter((id) => id !== stage.id);

  progress.highestUnlocked = Math.max(progress.highestUnlocked, Math.min(stages.length, stageState.index + 2));
  saveProgress();
  renderStage();
}

function skipStage() {
  const stage = getStage();

  if (stageState.solved || stageState.index >= stages.length - 1) {
    return;
  }

  if (!progress.solvedIds.includes(stage.id) && !progress.skippedIds.includes(stage.id)) {
    progress.skippedIds = [...progress.skippedIds, stage.id];
  }

  progress.highestUnlocked = Math.max(progress.highestUnlocked, Math.min(stages.length, stageState.index + 2));
  saveProgress();
  goToStage(stageState.index + 1);
  refs.feedback.textContent = "Level skipped for now. You can return from the progress wall after it is fixed.";
}

function goToNextStage() {
  if (!stageState.solved || stageState.index >= stages.length - 1) {
    return;
  }

  goToStage(stageState.index + 1);
  refs.feedback.textContent = "New stage loaded. Trust the page, not your first instinct.";
}

function fail(message) {
  refs.feedback.textContent = message;
  refs.board.classList.remove("is-wrong");
  void refs.board.offsetWidth;
  refs.board.classList.add("is-wrong");

  window.clearTimeout(shakeTimer);
  shakeTimer = window.setTimeout(() => {
    refs.board.classList.remove("is-wrong");
  }, 340);
}

function startPromptWordDrag(event, word, label) {
  if (stageState.solved) {
    return;
  }

  clearArmedPromptWord();
  cleanupDrag();

  dragState = {
    type: "word",
    word,
    label,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY
  };

  const ghost = createGhost(label);
  dragState.ghost = ghost;
  refs.board.classList.add("is-dragging");
  updateGhostPosition(event.clientX, event.clientY);
  bindDragListeners();
}

function startItemDrag(event, item) {
  if (stageState.solved) {
    return;
  }

  event.preventDefault();
  clearArmedPromptWord();
  cleanupDrag();

  const sourceEl = refs.board.querySelector(`[data-item-id="${item.id}"]`);
  if (!sourceEl) {
    return;
  }

  dragState = {
    type: "item",
    itemId: item.id,
    startX: event.clientX,
    startY: event.clientY,
    sourceEl
  };

  sourceEl.style.pointerEvents = "none";
  refs.board.classList.add("is-dragging");
  bindDragListeners();
}

function bindDragListeners() {
  document.addEventListener("pointermove", handleDragMove);
  document.addEventListener("pointerup", handleDragEnd);
  document.addEventListener("pointercancel", handleDragEnd);
}

function cleanupDrag() {
  document.removeEventListener("pointermove", handleDragMove);
  document.removeEventListener("pointerup", handleDragEnd);
  document.removeEventListener("pointercancel", handleDragEnd);

  if (dragState?.ghost) {
    dragState.ghost.remove();
  }

  if (dragState?.sourceEl) {
    dragState.sourceEl.style.pointerEvents = "";
  }

  refs.board.classList.remove("is-dragging");
  dragState = null;
}

function handleDragMove(event) {
  if (!dragState) {
    return;
  }

  if (dragState.type === "word") {
    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;
    updateGhostPosition(event.clientX, event.clientY);
    return;
  }

  if (dragState.type === "item") {
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    dragState.sourceEl.style.setProperty("--drag-x", `${dx}px`);
    dragState.sourceEl.style.setProperty("--drag-y", `${dy}px`);
    stageState.itemOffsets[dragState.itemId] = { x: dx, y: dy };
  }
}

function handleDragEnd(event) {
  if (!dragState) {
    return;
  }

  const stage = getStage();

  if (dragState.type === "word") {
    const candidate = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(`[data-accept-word="${dragState.word}"]`);

    if (
      stage.solution.kind === "dragPromptWord" &&
      stage.solution.word === dragState.word &&
      candidate &&
      candidate.dataset.itemId === stage.solution.target
    ) {
      registerAttempt();
      cleanupDrag();
      solveStage(stage.success);
      return;
    }

    const distance = Math.hypot(
      (dragState.currentX ?? dragState.startX) - dragState.startX,
      (dragState.currentY ?? dragState.startY) - dragState.startY
    );

    cleanupDrag();
    if (distance > 8) {
      registerAttempt();
      fail(stage.wrong);
    }
    return;
  }

  if (dragState.type === "item") {
    registerAttempt();

    const draggedItem = getStage().items.find((item) => item.id === dragState.itemId);
    const dx = stageState.itemOffsets[dragState.itemId]?.x || 0;
    const dy = stageState.itemOffsets[dragState.itemId]?.y || 0;
    const candidate = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(`[data-accept-item="${dragState.itemId}"]`);

    if (
      stage.solution.kind === "dragItem" &&
      stage.solution.item === dragState.itemId &&
      candidate &&
      candidate.dataset.itemId === stage.solution.target
    ) {
      cleanupDrag();
      solveStage(stage.success);
      return;
    }

    if (draggedItem?.revealThreshold && Math.hypot(dx, dy) > draggedItem.revealThreshold * 4) {
      stageState.revealed = true;
      cleanupDrag();
      refs.feedback.textContent = "That moved something. Now the real target is exposed.";
      renderStage();
      return;
    }

    stageState.itemOffsets[dragState.itemId] = { x: 0, y: 0 };
    cleanupDrag();
    renderBoard();
    fail(stage.wrong);
  }
}

function createGhost(label) {
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.textContent = label;
  document.body.append(ghost);
  return ghost;
}

function updateGhostPosition(x, y) {
  if (!dragState?.ghost) {
    return;
  }

  dragState.ghost.style.left = `${x}px`;
  dragState.ghost.style.top = `${y}px`;
}

function startHold(event, itemId) {
  const stage = getStage();

  if (stageState.solved || stage.solution.kind !== "hold" || stage.solution.target !== itemId) {
    return;
  }

  event.preventDefault();
  clearArmedPromptWord();
  cleanupHold(false);
  registerAttempt();

  const element = refs.board.querySelector(`[data-item-id="${itemId}"]`);
  if (!element) {
    return;
  }

  holdState = {
    itemId,
    element,
    startedAt: performance.now(),
    duration: stage.solution.duration,
    scale: stage.solution.scale
  };

  document.addEventListener("pointerup", handleHoldEnd);
  document.addEventListener("pointercancel", handleHoldEnd);

  holdState.timer = window.setInterval(() => {
    if (!holdState) {
      return;
    }

    const elapsed = performance.now() - holdState.startedAt;
    const progressRatio = clamp(elapsed / holdState.duration, 0, 1);
    stageState.holdScale = 1 + progressRatio * (holdState.scale - 1);
    holdState.element.style.setProperty("--item-scale", String(stageState.holdScale));

    if (progressRatio >= 1) {
      cleanupHold(true);
      solveStage(stage.success);
    }
  }, 30);
}

function handleHoldEnd() {
  cleanupHold(false);
  if (!stageState.solved) {
    fail(getStage().wrong);
  }
}

function cleanupHold(keepScale) {
  document.removeEventListener("pointerup", handleHoldEnd);
  document.removeEventListener("pointercancel", handleHoldEnd);

  if (holdState?.timer) {
    window.clearInterval(holdState.timer);
  }

  if (!keepScale) {
    stageState.holdScale = 1;
    const stage = getStage();
    if (stage?.solution?.kind === "hold") {
      const element = refs.board.querySelector(`[data-item-id="${stage.solution.target}"]`);
      if (element) {
        element.style.setProperty("--item-scale", "1");
      }
    }
  }

  holdState = null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
