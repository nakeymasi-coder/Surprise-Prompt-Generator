"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  const lockButtons = Array.from(document.querySelectorAll(".lock-button"));

  const randomizeButton = document.getElementById("randomize-button");
  const generateButtonTop = document.getElementById("generate-button-top");
  const generateButton = document.getElementById("generate-button");
  const copyButton = document.getElementById("copy-button");
  const clearButton = document.getElementById("clear-button");
  const promptOutput = document.getElementById("prompt-output");
  const copyStatus = document.getElementById("copy-status");

  const customFields = {
    character: document.getElementById("custom-character"),
    scene: document.getElementById("custom-scene"),
    affirmation: document.getElementById("custom-affirmation"),
    "thought-bubble": document.getElementById("custom-thought")
  };

  const groupNames = ["character", "scene", "affirmation", "thought-bubble"];

  const presets = {
    "cosmic-confidence": {
      character: "adult-woman",
      scene: "alien-world",
      affirmation: "confidence",
      "thought-bubble": "dreamy-glow"
    },
    "luxury-at-sea": {
      character: "adult-couple",
      scene: "luxury-boat",
      affirmation: "abundance",
      "thought-bubble": "silver-shimmer"
    },
    "enchanted-garden": {
      character: "adult-woman",
      scene: "enchanted-garden",
      affirmation: "self-love",
      "thought-bubble": "classic-cloud"
    },
    "candy-dreams": {
      character: "adult-group",
      scene: "candy-kingdom",
      affirmation: "confidence",
      "thought-bubble": "comic-pop"
    },
    "underwater-wonder": {
      character: "adult-man",
      scene: "underwater-world",
      affirmation: "peace",
      "thought-bubble": "dreamy-glow"
    },
    "city-of-possibility": {
      character: "adult-couple",
      scene: "whimsical-city",
      affirmation: "success",
      "thought-bubble": "silver-shimmer"
    }
  };

  const affirmationText = {
    confidence: "I trust myself, own my power, and move boldly through every opportunity.",
    "self-love": "I honor who I am, care for myself deeply, and know that I am enough.",
    abundance: "I welcome joyful opportunities, meaningful support, and growing abundance into my life.",
    peace: "I give myself permission to slow down, breathe deeply, and choose peace.",
    growth: "I am growing, healing, and becoming more of who I am meant to be every day.",
    success: "I am focused, capable, and ready to turn my goals into meaningful success."
  };

  const thoughtText = {
    "classic-cloud": "Everything I need is already within me.",
    "dreamy-glow": "Beautiful possibilities are finding me now.",
    "comic-pop": "Yes—I can absolutely do this!",
    "silver-shimmer": "I am ready for what is meant for me."
  };

  const characterRules = {
    "adult-woman": "Keep her clearly adult and preserve her chosen age, skin tone, body type, features, and proportions.",
    "adult-man": "Keep him clearly adult and masculine, preserving his chosen age, skin tone, body type, features, and proportions.",
    "adult-couple": "Keep both people clearly adult, distinct, naturally posed, and consistent in appearance.",
    "adult-group": "Keep every person clearly adult, visually distinct, naturally arranged, and consistent in appearance."
  };

  function getRadios(name) {
    return Array.from(document.querySelectorAll(`input[type="radio"][name="${name}"]`));
  }

  function getSelected(name) {
    return document.querySelector(`input[type="radio"][name="${name}"]:checked`);
  }

  function getCardText(radio, selector) {
    const card = radio ? radio.closest(".choice-card") : null;
    const element = card ? card.querySelector(selector) : null;
    return element ? element.textContent.trim() : "";
  }

  function chooseRadio(name, value) {
    const radio = document.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
    }
  }

  function isLocked(name) {
    const button = document.querySelector(`.lock-button[data-lock="${name}"]`);
    return button ? button.getAttribute("aria-pressed") === "true" : false;
  }

  function setLock(button, locked) {
    const label = button.dataset.lock === "preset"
      ? "Preset"
      : button.dataset.lock.replace("thought-bubble", "Thought Bubble").replace(/^./, letter => letter.toUpperCase());

    button.setAttribute("aria-pressed", String(locked));
    button.textContent = locked ? `Unlock ${label}` : `Lock ${label}`;
  }

  function openTab(button, moveFocus = false) {
    const panelId = button.getAttribute("aria-controls");

    tabButtons.forEach(tab => {
      const isActive = tab === button;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    tabPanels.forEach(panel => {
      const isActive = panel.id === panelId;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (moveFocus) {
      button.focus();
    }
  }

  function clearCustomField(name) {
    if (customFields[name]) {
      customFields[name].value = "";
    }
  }

  function clearPresetSelection() {
    getRadios("preset").forEach(radio => {
      radio.checked = false;
    });
  }

  function applyPreset(presetValue) {
    const preset = presets[presetValue];
    if (!preset) {
      return;
    }

    Object.entries(preset).forEach(([name, value]) => {
      chooseRadio(name, value);
      clearCustomField(name);
    });

    copyStatus.textContent = "Preset applied. You can change any unlocked choice.";
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomize() {
    const selectedPreset = getSelected("preset");

    if (isLocked("preset") && selectedPreset) {
      applyPreset(selectedPreset.value);
    } else {
      const presetOptions = getRadios("preset");
      const randomPreset = randomItem(presetOptions);
      if (randomPreset) {
        randomPreset.checked = true;
      }

      groupNames.forEach(name => {
        if (isLocked(name)) {
          return;
        }

        const options = getRadios(name);
        const randomChoice = randomItem(options);
        if (randomChoice) {
          randomChoice.checked = true;
          clearCustomField(name);
        }
      });
    }

    copyStatus.textContent = "Your unlocked choices were randomized.";
  }

  function ensureSelections() {
    groupNames.forEach(name => {
      const hasCustomText = customFields[name] && customFields[name].value.trim();
      if (!getSelected(name) && !hasCustomText) {
        const firstOption = getRadios(name)[0];
        if (firstOption) {
          firstOption.checked = true;
        }
      }
    });
  }

  function createPrompt() {
    ensureSelections();

    const characterRadio = getSelected("character");
    const sceneRadio = getSelected("scene");
    const affirmationRadio = getSelected("affirmation");
    const bubbleRadio = getSelected("thought-bubble");

    const customCharacter = customFields.character.value.trim();
    const customScene = customFields.scene.value.trim();
    const customAffirmation = customFields.affirmation.value.trim();
    const customThought = customFields["thought-bubble"].value.trim();

    const character = customCharacter || getCardText(characterRadio, ".choice-description");
    const scene = customScene || getCardText(sceneRadio, ".choice-description");
    const affirmation = customAffirmation || affirmationText[affirmationRadio ? affirmationRadio.value : ""];
    const bubbleStyle = getCardText(bubbleRadio, ".choice-description");
    const bubbleWords = customThought || thoughtText[bubbleRadio ? bubbleRadio.value : ""];
    const characterRule = characterRadio ? characterRules[characterRadio.value] : "Keep every character clearly adult and preserve all requested features and proportions.";

    const promptParts = [
      `Create a polished, imaginative affirmation image featuring ${character}.`,
      `Place the character or characters in this scene: ${scene}.`,
      "Use a dreamy fantasy art direction with soft clouds, tiny controlled stars, gentle purple lighting, subtle silver shine, rich royal-purple accents, clean composition, and refined visual hierarchy.",
      `Show the exact affirmation text: “${affirmation}” Make every word correctly spelled, fully visible, unobstructed, and easy to read.`,
      `Include ${bubbleStyle.toLowerCase()} Inside it, show the exact thought: “${bubbleWords}” Keep the thought bubble separate from the main affirmation and make both pieces of text easy to distinguish.`,
      characterRule,
      "Avoid crowns, tiaras, futuristic interfaces, fake data displays, excessive sparkles, clutter, random floating icons, and unrelated objects. Create a cohesive, professionally finished image with realistic materials, intentional spacing, and no duplicate or conflicting details."
    ];

    promptOutput.value = promptParts.filter(Boolean).join(" ");
    copyStatus.textContent = "Your complete image prompt is ready.";
    document.querySelector(".prompt-results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyPrompt() {
    const text = promptOutput.value.trim();

    if (!text) {
      copyStatus.textContent = "Generate a prompt before copying.";
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        promptOutput.focus();
        promptOutput.select();
        document.execCommand("copy");
        promptOutput.setSelectionRange(0, 0);
      }
      copyStatus.textContent = "Prompt copied!";
    } catch (error) {
      promptOutput.focus();
      promptOutput.select();
      copyStatus.textContent = "Copy was blocked. Your prompt is selected—press Ctrl+C to copy it.";
    }
  }

  function clearGenerator() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });

    Object.values(customFields).forEach(field => {
      field.value = "";
    });

    lockButtons.forEach(button => setLock(button, false));
    promptOutput.value = "";
    copyStatus.textContent = "Everything has been cleared.";
    openTab(document.getElementById("presets-tab"));
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => openTab(button));

    button.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = index;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabButtons.length - 1;

      openTab(tabButtons[nextIndex], true);
    });
  });

  getRadios("preset").forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        applyPreset(radio.value);
      }
    });
  });

  groupNames.forEach(name => {
    getRadios(name).forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          clearCustomField(name);
          if (!isLocked("preset")) {
            clearPresetSelection();
          }
        }
      });
    });

    const customField = customFields[name];
    customField.addEventListener("input", () => {
      if (customField.value.trim()) {
        getRadios(name).forEach(radio => {
          radio.checked = false;
        });
        if (!isLocked("preset")) {
          clearPresetSelection();
        }
      }
    });
  });

  lockButtons.forEach(button => {
    button.addEventListener("click", () => {
      const willLock = button.getAttribute("aria-pressed") !== "true";
      setLock(button, willLock);
      copyStatus.textContent = willLock ? "Choice locked." : "Choice unlocked.";
    });
  });

  randomizeButton.addEventListener("click", randomize);
  generateButtonTop.addEventListener("click", createPrompt);
  generateButton.addEventListener("click", createPrompt);
  copyButton.addEventListener("click", copyPrompt);
  clearButton.addEventListener("click", clearGenerator);

  openTab(document.getElementById("presets-tab"));
});
