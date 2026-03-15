// ─── 모델 설정 ──────────────────────────────────────────────────────────────
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/lqfxaA079/";

// ─── 로딩 메시지 시퀀스 ─────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  "당신의 퍼스널 컬러 톤을 분석 중...",
  "옷장의 숨겨진 무드를 찾는 중...",
  "핀터레스트 재질 여부를 확인 중...",
  "AI가 스타일 DNA를 해독 중...",
  "무드 매칭 데이터베이스와 대조 중...",
  "결과를 정리하는 중... 거의 다 됐어! 🔥",
];

// ─── 결과 데이터 ─────────────────────────────────────────────────────────────
const MOOD_RESULTS = {
  "긱시크 (Geek Chic)": {
    badge: "GEEK CHIC",
    title: "안경 쓴 비밀 힙스터 🤓 찐 긱시크 인간",
    desc: "오늘 당신의 룩에서는 너드미와 힙함이 절묘하게 공존하는 향기가 나요! 체크 패턴과 레이어드 스타일이 당신의 지적인 매력을 200% 끌어올리고 있어요.",
    item: "두꺼운 프레임 안경이나 빈티지 카디건을 더하면 완전 핀터레스트 재질 완성 📚",
    goodMatch: "올드머니 인간 (지성미 콜라보)",
    badMatch: "Y2K 인간 (에너지가 너무 달라!)",
  },
  "고프코어 (Gorpcore)": {
    badge: "GORPCORE",
    title: "도심 속 아웃도어 탐험가 🏕️ 찐 고프코어 인간",
    desc: "오늘 당신의 룩에서는 자연 친화적인 쿨한 에너지가 느껴져요! 기능성 아웃도어 피스와 스트리트 감성의 조합이 당신의 힙한 탐험가 무드를 완성시켜주고 있어요.",
    item: "노스페이스 눕시 패딩이나 살로몬 스니커즈를 매치하면 완전 핀터레스트 재질 완성 🎒",
    goodMatch: "긱시크 인간 (기능미 + 지성미 콜라보)",
    badMatch: "발레코어 인간 (무드가 정반대!)",
  },
  "올드머니 (Old Money)": {
    badge: "OLD MONEY",
    title: "걸어다니는 인간 랄프로렌 💎 찐 올드머니 인간",
    desc: "오늘 당신의 룩에서는 로고 없이도 빛나는 조용한 럭셔리 향기가 나요! 절제된 컬러와 클래식한 실루엣이 당신의 고급스러운 무드를 완성시켜주고 있어요.",
    item: "카멜 컬러 캐시미어 코트나 펜슬 스커트 + 로퍼 조합이면 완전 핀터레스트 재질 완성 🤍",
    goodMatch: "긱시크 인간 (지성미 콜라보)",
    badMatch: "Y2K 인간 (너무 시끄러워!)",
  },
  "발레코어 (Balletcore)": {
    badge: "BALLETCORE",
    title: "인간 복숭아 등장 🍑 로맨틱 발레코어 인간",
    desc: "오늘 당신의 룩에서는 몽글몽글한 핑크빛 쿨톤 향기가 나네요! 부드러운 파스텔 톤과 러블리한 디테일이 당신의 사랑스러움을 200% 끌어올려주고 있어요.",
    item: "실버 메탈릭 리본 초커나 화이트 메리제인 슈즈를 매치하면 완전 핀터레스트 재질 완성 🎀",
    goodMatch: "고프코어 인간 (서로의 매력을 보완해 줌)",
    badMatch: "올드머니 인간 (너무 진지해!)",
  },
  "Y2K 맥시멀리즘": {
    badge: "Y2K",
    title: "2000년대 타임머신 탑승 완료 ✨ 찐 Y2K 인간",
    desc: "오늘 당신의 룩에서는 화려하고 자유분방한 2000년대 에너지가 폭발하고 있어요! 컬러풀한 레이어링과 맥시멀한 디테일이 당신의 개성을 200% 발산시켜주고 있어요.",
    item: "버터플라이 클립이나 홀로그램 미니백을 매치하면 완전 핀터레스트 재질 완성 💅",
    goodMatch: "발레코어 인간 (여성미 콜라보)",
    badMatch: "올드머니 인간 (정반대 무드!)",
  },
};

// ─── DOM 참조 ────────────────────────────────────────────────────────────────
const imageUpload      = document.getElementById("imageUpload");
const uploadBox        = document.getElementById("uploadBox");
const uploadLabel      = document.querySelector(".upload-label");
const previewContainer = document.getElementById("previewContainer");
const previewImage     = document.getElementById("previewImage");
const retakeBtn        = document.getElementById("retakeBtn");
const analyzeBtn       = document.getElementById("analyzeBtn");
const loadingOverlay   = document.getElementById("loadingOverlay");
const loadingText      = document.getElementById("loadingText");
const resultSection    = document.getElementById("resultSection");
const resultBadge      = document.getElementById("resultBadge");
const resultTitle      = document.getElementById("resultTitle");
const resultDesc       = document.getElementById("resultDesc");
const resultItem       = document.getElementById("resultItem");
const resultGoodMatch  = document.getElementById("resultGoodMatch");
const resultBadMatch   = document.getElementById("resultBadMatch");
const confidenceFill   = document.getElementById("confidenceFill");
const confidenceValue  = document.getElementById("confidenceValue");
const shareBtn         = document.getElementById("shareBtn");
const retryBtn         = document.getElementById("retryBtn");

// ─── 모델 상태 ───────────────────────────────────────────────────────────────
let model = null;
let currentImageElement = null;
let loadingTimer = null;

// ─── 이미지 업로드 & 미리보기 ────────────────────────────────────────────────
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleFile(file);
});

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) handleFile(file);
});

const handleFile = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.onload = () => {
      currentImageElement = previewImage;
      analyzeBtn.disabled = false;
    };
    previewImage.src = event.target.result;
    uploadLabel.style.display = "none";
    previewContainer.classList.add("visible");
    resultSection.classList.remove("visible");
  };
  reader.readAsDataURL(file);
};

// ─── 다시 고르기 / 처음부터 다시 ────────────────────────────────────────────
const resetUpload = () => {
  imageUpload.value = "";
  previewImage.src = "";
  currentImageElement = null;
  uploadLabel.style.display = "block";
  previewContainer.classList.remove("visible");
  resultSection.classList.remove("visible");
  analyzeBtn.disabled = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

retakeBtn.addEventListener("click", resetUpload);
retryBtn.addEventListener("click", resetUpload);

// ─── 모델 로드 ───────────────────────────────────────────────────────────────
const loadModel = async () => {
  if (model) return;
  model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
};

// ─── 로딩 메시지 순환 ────────────────────────────────────────────────────────
const startLoadingMessages = () => {
  let idx = 0;
  loadingText.textContent = LOADING_MESSAGES[idx];

  loadingTimer = setInterval(() => {
    idx = (idx + 1) % LOADING_MESSAGES.length;
    loadingText.classList.add("fade-out");
    setTimeout(() => {
      loadingText.textContent = LOADING_MESSAGES[idx];
      loadingText.classList.remove("fade-out");
    }, 300);
  }, 1000);
};

const stopLoadingMessages = () => {
  clearInterval(loadingTimer);
  loadingTimer = null;
};

// ─── 로딩 토글 ───────────────────────────────────────────────────────────────
const showLoading = (visible) => {
  if (visible) {
    loadingOverlay.classList.add("visible");
    startLoadingMessages();
  } else {
    loadingOverlay.classList.remove("visible");
    stopLoadingMessages();
  }
};

// ─── 분석 실행 ───────────────────────────────────────────────────────────────
analyzeBtn.addEventListener("click", async () => {
  if (!currentImageElement) return;

  showLoading(true);
  analyzeBtn.disabled = true;

  try {
    await loadModel();
    const predictions = await model.predict(currentImageElement);
    const top = predictions.reduce((prev, curr) =>
      curr.probability > prev.probability ? curr : prev
    );
    showResult(top.className, top.probability);
  } catch (err) {
    console.error("예측 오류:", err);
    alert("AI 분석 중 오류가 발생했어요. 다시 시도해 주세요 🥲");
    analyzeBtn.disabled = false;
  } finally {
    showLoading(false);
  }
});

// ─── 결과 표시 ───────────────────────────────────────────────────────────────
const showResult = (className, probability) => {
  const data = MOOD_RESULTS[className] ?? {
    badge: "MOOD",
    title: "독창적인 무드의 소유자 ✨",
    desc: "당신만의 유니크한 스타일이 있어요! 어떤 카테고리에도 속하지 않는 당신만의 무드.",
    item: "지금 그 스타일 그대로가 완벽해요 💫",
    goodMatch: "모든 무드와 잘 어울려요",
    badMatch: "없음 (무드 천재)",
  };

  resultBadge.textContent    = data.badge;
  resultTitle.textContent    = data.title;
  resultDesc.textContent     = data.desc;
  resultItem.textContent     = data.item;
  resultGoodMatch.textContent = data.goodMatch;
  resultBadMatch.textContent  = data.badMatch;
  confidenceValue.textContent = `${(probability * 100).toFixed(1)}%`;

  resultSection.classList.add("visible");

  requestAnimationFrame(() => {
    confidenceFill.style.width = `${(probability * 100).toFixed(1)}%`;
  });

  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
};

// ─── 카카오 SDK 초기화 ────────────────────────────────────────────────────────
Kakao.init("a9c5a8d8900bca75619ed492127a0b50");

// ─── 카카오톡 공유 ───────────────────────────────────────────────────────────
shareBtn.addEventListener("click", () => {
  const className = resultTitle.textContent || "나의 OOTD 무드";
  const data = MOOD_RESULTS[
    Object.keys(MOOD_RESULTS).find(k => MOOD_RESULTS[k].title === className)
  ] ?? { desc: "" };
  const serviceUrl = "https://ootd-mood.ehdqhddl91.workers.dev";

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: className,
      description: data.desc,
      imageUrl: "https://ootd-mood.ehdqhddl91.workers.dev/og-image.png",
      link: { mobileWebUrl: serviceUrl, webUrl: serviceUrl },
    },
    buttons: [
      {
        title: "나도 진단받기 ✨",
        link: { mobileWebUrl: serviceUrl, webUrl: serviceUrl },
      },
    ],
  });
});
