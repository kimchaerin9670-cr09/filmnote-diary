// DiaryWritePage.jsx(일기장 작성(폼) 페이지)

import { useEffect, useState, useRef, useCallback } from "react";
import { saveDiary } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { fetchWeather, dfs_xy_conv } from "../utils/getWeather";
import { useSaveHandler } from "../contexts/SaveContext";
import axios from "axios";
import styles from "./DiaryWritePage.module.css";

const WEATHER_EMOJI = {
  "맑음": "☀️",
  "구름 많음": "⛅",
  "흐림": "☁️",
  "비": "🌧️",
  "비/눈": "🌨️",
  "눈": "❄️",
};

export default function DiaryWritePage() {
  const fileInputRef = useRef(null); // 파일 input DOM을 가리키는 ref
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const navigate = useNavigate();
  const [todayDate, setTodayDate] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst;
  }); // 오늘 날짜 기본(toISOString -> UTC라 9시간이 밀려, 한국 기준으로 바꿔줌)
  const [dateStr, setDateStr] = useState(todayDate.toISOString().slice(0, 10));
  const { setSaveHandler } = useSaveHandler();
  const [previewURLs, setPreviewURLs] = useState([]);

  const handleSubmit = useCallback(
    // 무한 렌더링/상태 업데이트 오류로 useCallback 추가
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const token = sessionStorage.getItem("userToken");

      // 익명 사용자는 로컬스토리지에 저장
      if (!token) {
        const newDiary = {
          id: Date.now(),
          title: title || "제목 없음",
          content,
          created_at: dateStr,
          weather,
        };
        saveDiary(newDiary);
        alert("일기 등록 성공!");
        navigate("/");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("created_at", dateStr); // yyyy-mm-dd
      formData.append("weather", weather);
      selectedFiles.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const res = await axios.post("/api/diary/write", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data.message);
        if (res.data.success) {
          alert("일기 등록 성공!");
          // 페이지 이동 등 처리
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        alert("등록 중 오류 발생");
      }
    },
    [title, content, dateStr, weather, selectedFiles]
  );

  const removePhoto = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handlePlusClick = () => {
    fileInputRef.current.click(); // 버튼 클릭 시 file input 클릭을 강제로 발생
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...selectedFiles, ...files];

    if (combined.length > 5) {
      alert("사진은 최대 5개까지 첨부할 수 있습니다.");
    }

    setSelectedFiles(combined.slice(0, 5));
    // 같은 파일 다시 선택 가능하게 input 리셋
    e.target.value = "";
  };

  // 발표 기준 시각(날짜+시간)을 함께 계산
  // 날짜와 시간을 따로 계산하면 자정 근처에서 날짜가 안 맞는 문제가 생겨서 하나로 합침
  function getBaseDateTime(date) {
    const target = new Date(date); // 원본 날짜 객체를 건드리지 않기 위해 복사
    const minute = target.getMinutes();

    // 초단기예보는 매시간 30분에 발표되고, 발표 후 약 45분 뒤부터 조회 가능
    // 45분이 안 지났으면 아직 최신 발표가 안 된 거라 이전 시간 걸로 요청
    if (minute < 45) {
      target.setHours(target.getHours() - 1); // hour가 -1이 되면 Date가 알아서 전날 23시로 넘겨줌 (자정 케이스 자동 처리)
    }

    const baseDate = target.toISOString().slice(0, 10).replace(/-/g, ""); // 날짜 (yyyyMMdd)
    const baseTime = target.getHours().toString().padStart(2, "0") + "30"; // 시간 (HH30)

    return { baseDate, baseTime };
  }

  // 위치, 날짜, 시간 정보 날씨 API에 보내서 날씨 정보 가져오기
  useEffect(() => {
    const { baseDate, baseTime } = getBaseDateTime(todayDate); // 날짜 + 시간 같이 계산

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nx = position.coords.latitude;
          const ny = position.coords.longitude;
          // const nx = 38.0684; // 샘플(강원도 인제)
          // const ny = 128.1707; // 샘플(강원도 인제)
          const { x, y } = dfs_xy_conv(nx, ny);
          fetchWeather(baseDate, baseTime, x, y).then(setWeather);
        },
        (error) => {
          console.error("위치 정보 에러:", error);
        }
      );
    } else {
      console.error("이 브라우저는 geolocation을 지원하지 않음");
    }
  }, [todayDate]);

  // 1분마다 현재 날짜 확인
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const nowStr = kst.toISOString().slice(0, 10);
      const todayStr = todayDate.toISOString().slice(0, 10);

      if (nowStr !== todayStr) {
        // 날짜가 바뀐 경우
        setTodayDate(kst);
        setDateStr(nowStr);
      }
    }, 60 * 1000); // 1분마다 체크

    return () => clearInterval(timer);
  }, [todayDate]);

  // URL.createObjectURL() 정리
  useEffect(() => {
    const newURLs = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewURLs(newURLs);

    return () => {
      newURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    setSaveHandler(() => handleSubmit); // 저장 함수 등록
  }, [handleSubmit]);

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <div className={styles.photoSide}>
        <input
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
        />

        <div className={styles.metaRow}>
          <span className={`${styles.metaTag} ${styles.dateTag}`}>
            날짜 : {dateStr}
          </span>
          {weather && (
            <span className={`${styles.metaTag} ${styles.weatherTag}`}>
              날씨 : {WEATHER_EMOJI[weather] || ""} {weather}
            </span>
          )}
        </div>

        {sessionStorage.getItem("userToken") ? (
          <div className={styles.photoGrid}>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.photoItem}>
                <img
                  className={styles.photoImg}
                  src={previewURLs[index]}
                  alt={`preview-${index}`}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removePhoto(index)}
                >
                  ✕
                </button>
              </div>
            ))}

            {selectedFiles.length === 0 ? (
              <button
                type="button"
                className={styles.addPhotoBtnLarge}
                onClick={handlePlusClick}
              >
                <span className={styles.plusIconLarge}>+</span>
                사진을 추가해주세요
              </button>
            ) : selectedFiles.length < 5 ? (
              <button
                type="button"
                className={styles.addPhotoBtn}
                onClick={handlePlusClick}
              >
                <span className={styles.plusIcon}>+</span>
                사진 추가
              </button>
            ) : null}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              ref={fileInputRef} // ref로 연결
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <p className={styles.emptyText}>익명 사용자는 사진 첨부를 지원하지 않아요</p>
        )}
      </div>

      <div className={styles.contentSide}>
        <div className={styles.notebookLines} />
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="일기를 입력하세요"
        />
      </div>
    </form>
  );
}