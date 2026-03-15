// ─── 모델 설정 ──────────────────────────────────────────────────────────────
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/lqfxaA079/";

// ─── 결과 텍스트 매핑 ────────────────────────────────────────────────────────
const MOOD_RESULTS = {
  "긱시크 (Geek Chic)": {
    badge: "GEEK CHIC",
    text: "안경과 체크 패턴의 조화! 너디함 속에 감춰진 힙한 감성, 긱시크의 정석입니다.",
  },
  "고프코어 (Gorpcore)": {
    badge: "GORPCORE",
    text: "바람막이와 트레킹화? 오늘 당신은 도심 속 힙한 탐험가, 고프코어 재질!",
  },
  "올드머니 (Old Money)": {
    badge: "OLD MONEY",
    text: "로고 없이도 빛나는 고급스러움. 당신은 걸어다니는 인간 랄프로렌, 올드머니의 표본입니다.",
  },
  "발레코어 (Balletcore)": {
    badge: "BALLETCORE",
    text: "리본과 파스텔톤의 조화 🎀 몽글몽글 러블리한 발레코어 인간 🍑",
  },
  "Y2K 맥시멀리즘": {
    badge: "Y2K",
    text: "컬러풀하고 강렬한 포스! 2000년대 감성을 완벽하게 찢어버린 Y2K 스타✨",
  },
};

// ─── DOM 참조 ────────────────────────────────────────────────────────────────
const imageUpload     = document.getElementById("imageUpload");
const uploadBox       = document.getElementById("uploadBox");
const uploadLabel     = document.querySelector(".upload-label");
const previewContainer = document.getElementById("previewContainer");
const previewImage    = document.getElementById("previewImage");
const retakeBtn       = document.getElementById("retakeBtn");
const analyzeBtn      = document.getElementById("analyzeBtn");
const loadingOverlay  = document.getElementById("loadingOverlay");
const resultSection   = document.getElementById("resultSection");
const resultBadge     = document.getElementById("resultBadge");
const resultClass     = document.getElementById("resultClass");
const resultText      = document.getElementById("resultText");
const confidenceFill  = document.getElementById("confidenceFill");
const confidenceValue = document.getElementById("confidenceValue");
const shareBtn        = document.getElementById("shareBtn");
const retryBtn        = document.getElementById("retryBtn");

// ─── 모델 상태 ───────────────────────────────────────────────────────────────
let model = null;
let currentImageElement = null;


// ─── 이미지 업로드 & 미리보기 ────────────────────────────────────────────────
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleFile(file);
});

// 드래그 앤 드롭 지원
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) handleFile(file);
});

const handleFile = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    // onload 핸들러를 src 설정 전에 먼저 등록해야 data URL 경쟁 조건 방지
    previewImage.onload = () => {
      currentImageElement = previewImage;
      analyzeBtn.disabled = false;
    };
    previewImage.src = event.target.result;
    // UI 전환: 업로드 박스 숨기고 미리보기 표시
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
};

retakeBtn.addEventListener("click", resetUpload);
retryBtn.addEventListener("click", resetUpload);

// ─── 모델 로드 (첫 분석 시 lazy load) ───────────────────────────────────────
const loadModel = async () => {
  if (model) return;
  const modelURL    = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
};

// ─── 분석 실행 ───────────────────────────────────────────────────────────────
analyzeBtn.addEventListener("click", async () => {
  if (!currentImageElement) return;

  showLoading(true);
  analyzeBtn.disabled = true;

  try {
    await loadModel();
    const predictions = await model.predict(currentImageElement);

    // 확률 최고값 클래스 선택
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
    text: "독창적인 스타일이네요! 당신만의 무드가 있어요 ✨",
  };

  resultBadge.textContent    = data.badge;
  resultClass.textContent    = className;
  resultText.textContent     = data.text;
  confidenceValue.textContent = `${(probability * 100).toFixed(1)}%`;

  resultSection.classList.add("visible");

  // 애니메이션을 위해 다음 프레임에서 너비 적용
  requestAnimationFrame(() => {
    confidenceFill.style.width = `${(probability * 100).toFixed(1)}%`;
  });

  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// ─── 로딩 토글 ───────────────────────────────────────────────────────────────
const showLoading = (visible) => {
  loadingOverlay.classList.toggle("visible", visible);
};

// ─── 카카오 SDK 초기화 ────────────────────────────────────────────────────────
Kakao.init("a9c5a8d8900bca75619ed492127a0b50");

// ─── 카카오톡 공유 ───────────────────────────────────────────────────────────
shareBtn.addEventListener("click", () => {
  const className = resultClass.textContent || "나의 OOTD 무드";
  const data = MOOD_RESULTS[className] ?? { badge: "MOOD", text: "" };
  const serviceUrl = "https://ootd-mood.ehdqhddl91.workers.dev";

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `나의 OOTD 무드는 "${className}"`,
      description: data.text,
      imageUrl: "https://opengraph.githubassets.com/1/ehdqhddl/ootd-mood",
      link: {
        mobileWebUrl: serviceUrl,
        webUrl: serviceUrl,
      },
    },
    buttons: [
      {
        title: "나도 진단받기 ✨",
        link: {
          mobileWebUrl: serviceUrl,
          webUrl: serviceUrl,
        },
      },
    ],
  });
});
