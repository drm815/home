const seasonSelect = document.getElementById("season");
const timeSelect = document.getElementById("timeOfDay");
const loadPresetBtn = document.getElementById("loadPreset");
const checkSettingsBtn = document.getElementById("checkSettings");
const feedbackContainer = document.getElementById("feedback");
const tipsContainer = document.getElementById("tips");

const controls = {
  temperature: document.getElementById("temperature"),
  humidity: document.getElementById("humidity"),
  ventilation: document.getElementById("ventilation"),
  lighting: document.getElementById("lighting"),
};

const valueLabels = {
  temperature: document.getElementById("temperatureValue"),
  humidity: document.getElementById("humidityValue"),
  ventilation: document.getElementById("ventilationValue"),
  lighting: document.getElementById("lightingValue"),
};

const recommendations = {
  spring: {
    morning: { temperature: [21, 23], humidity: [40, 50], ventilation: [4, 5], lighting: [500, 550] },
    noon: { temperature: [22, 24], humidity: [45, 55], ventilation: [5, 6], lighting: [550, 600] },
    evening: { temperature: [20, 22], humidity: [45, 55], ventilation: [3, 4], lighting: [400, 450] },
  },
  summer: {
    morning: { temperature: [24, 26], humidity: [50, 60], ventilation: [6, 7], lighting: [450, 500] },
    noon: { temperature: [25, 27], humidity: [55, 65], ventilation: [7, 8], lighting: [500, 550] },
    evening: { temperature: [24, 25], humidity: [55, 65], ventilation: [5, 6], lighting: [400, 450] },
  },
  autumn: {
    morning: { temperature: [21, 22], humidity: [45, 55], ventilation: [4, 5], lighting: [500, 550] },
    noon: { temperature: [22, 23], humidity: [45, 55], ventilation: [5, 6], lighting: [550, 600] },
    evening: { temperature: [20, 21], humidity: [40, 50], ventilation: [4, 5], lighting: [420, 470] },
  },
  winter: {
    morning: { temperature: [20, 22], humidity: [35, 45], ventilation: [3, 4], lighting: [520, 580] },
    noon: { temperature: [21, 23], humidity: [35, 45], ventilation: [4, 5], lighting: [540, 600] },
    evening: { temperature: [20, 22], humidity: [35, 45], ventilation: [3, 4], lighting: [450, 500] },
  },
};

const seasonTips = {
  spring: "봄철에는 꽃가루가 많을 수 있어요. 환기할 때는 공기청정기나 필터를 함께 사용해요.",
  summer: "여름에는 실내 온도가 쉽게 올라가요. 에어컨과 환기를 번갈아 사용하면 좋아요.",
  autumn: "가을은 일교차가 커요. 환기 후에는 창문을 꼭 닫고 적절한 온도를 유지해요.",
  winter: "겨울에는 공기가 건조해지기 쉬우니 가습기를 사용하고, 짧게 자주 환기해요.",
};

const timeTips = {
  morning: "아침에는 학생들이 등교하면서 공기가 탁할 수 있으니 환기를 먼저 해 주세요.",
  noon: "점심시간에는 활동량이 많으니 온도를 약간 낮추고, 환기를 충분히 해요.",
  evening: "저녁에는 햇빛이 줄어들어 조명이 중요해요. 집중하기 좋은 밝기를 맞춰요.",
};

function updateValueLabel(id) {
  const value = controls[id].value;
  switch (id) {
    case "temperature":
      valueLabels[id].textContent = `${value}°C`;
      break;
    case "humidity":
      valueLabels[id].textContent = `${value}%`;
      break;
    case "ventilation":
      valueLabels[id].textContent = `${value}회`;
      break;
    case "lighting":
      valueLabels[id].textContent = `${value}lx`;
      break;
  }
}

Object.keys(controls).forEach((key) => {
  controls[key].addEventListener("input", () => updateValueLabel(key));
});

function formatRange([min, max], unit) {
  return `${min}${unit} ~ ${max}${unit}`;
}

function applyPreset() {
  const preset = getCurrentRecommendation();
  Object.entries(preset).forEach(([key, range]) => {
    const middle = (range[0] + range[1]) / 2;
    controls[key].value = Math.round(middle * 10) / 10;
    updateValueLabel(key);
  });
  feedbackContainer.innerHTML =
    "<strong>추천 값이 적용되었어요!</strong> 슬라이더를 움직여 나만의 설정을 만들어도 좋아요.";
  feedbackContainer.classList.remove("hidden");
  updateTips();
}

function getCurrentRecommendation() {
  const season = seasonSelect.value;
  const time = timeSelect.value;
  return recommendations[season][time];
}

function checkSettings() {
  const season = seasonSelect.value;
  const time = timeSelect.value;
  const current = getCurrentRecommendation();

  const results = Object.entries(current).map(([key, range]) => {
    const value = Number(controls[key].value);
    const [min, max] = range;
    const withinRange = value >= min && value <= max;
    const unit = key === "temperature" ? "°C" : key === "humidity" ? "%" : key === "lighting" ? "lx" : "회";

    if (withinRange) {
      return `<li><strong class="good">좋아요!</strong> ${labelForKey(key)}가 권장 범위(${formatRange(range, unit)}) 안에 있어요.</li>`;
    }

    const direction = value < min ? "조금 더 높여" : "조금 낮춰";
    return `<li><strong class="adjust">조정 필요!</strong> ${labelForKey(key)}를 ${direction} 주세요. 권장 범위는 ${formatRange(range, unit)}입니다.</li>`;
  });

  feedbackContainer.innerHTML = `
    <p><strong>${translateSeason(season)} ${translateTime(time)}</strong>에 어울리는 환경인지 확인해 봤어요.</p>
    <ul>${results.join("")}</ul>
  `;
  feedbackContainer.classList.remove("hidden");
  updateTips();
}

function labelForKey(key) {
  switch (key) {
    case "temperature":
      return "온도";
    case "humidity":
      return "습도";
    case "ventilation":
      return "환기 횟수";
    case "lighting":
      return "조명 밝기";
    default:
      return key;
  }
}

function translateSeason(season) {
  return { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" }[season];
}

function translateTime(time) {
  return { morning: "아침", noon: "점심", evening: "저녁" }[time];
}

function updateTips() {
  const season = seasonSelect.value;
  const time = timeSelect.value;
  tipsContainer.innerHTML = `
    <strong>학습 팁</strong>
    <p>${seasonTips[season]}</p>
    <p>${timeTips[time]}</p>
  `;
}

loadPresetBtn.addEventListener("click", applyPreset);
checkSettingsBtn.addEventListener("click", checkSettings);
seasonSelect.addEventListener("change", () => {
  updateTips();
  feedbackContainer.classList.add("hidden");
});
timeSelect.addEventListener("change", () => {
  updateTips();
  feedbackContainer.classList.add("hidden");
});

Object.keys(controls).forEach((key) => updateValueLabel(key));
updateTips();
feedbackContainer.classList.add("hidden");
