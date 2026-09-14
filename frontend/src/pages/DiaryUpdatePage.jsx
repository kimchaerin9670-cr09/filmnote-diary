// DiaryUdatePage.jsx(일기장 수정 페이지)

import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSaveHandler } from "../contexts/SaveContext";
import styles from "./DiaryUpdatePage.module.css";

const WEATHER_EMOJI = {
  "맑음": "☀️",
  "구름 많음": "⛅",
  "흐림": "☁️",
  "비": "🌧️",
  "비/눈": "🌨️",
  "눈": "❄️",
};

export default function DiaryUpdatePage() {
  const { id } = useParams(); // 받아온 id
  const [diary, setDiary] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { setSaveHandler } = useSaveHandler();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // string | File 섞임
  const navigate = useNavigate();
  const [previewURLs, setPreviewURLs] = useState([]); // File 객체에 대응하는 미리보기 URL 배열

  console.log(id);

  useEffect(() => {
    // 컴포넌트가 마운트되었을 때 기존 일기 불러오기
    const fetchDiary = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.get(`/api/diary/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDiary(res.data);
        console.log(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchDiary();
  }, [id]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // 새로 업로드한 사진만 FormData에 넣기
      selectedFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append("file", file);
        }
      });

      // 남아있는 기존 사진 경로도 함께 보내기
      const remainingOldPaths = selectedFiles.filter(
        (f) => typeof f === "string"
      );
      formData.append("existingPaths", JSON.stringify(remainingOldPaths));

      // 사진이 하나도 없으면 서버가 완전 삭제 처리하도록 플래그
      if (selectedFiles.length === 0) {
        formData.append("clearPhotos", "true");
      }

      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.post(`/api/diary/update/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data.message);
        if (res.data.success) {
          alert("일기 수정 완료!");
          // 페이지 이동 등 처리
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        alert("수정 중 오류 발생");
      }
    },
    [title, content, selectedFiles]
  );

  useEffect(() => {
    if (diary) {
      setTitle(diary.title || "");
      setContent(diary.content || "");
      setSelectedFiles(diary.photo_paths || []);
    }
  }, [diary]);

  // URL.createObjectURL() 정리
  useEffect(() => {
    const urls = selectedFiles
      .filter((f) => !(typeof f === "string"))
      .map((f) => URL.createObjectURL(f));

    setPreviewURLs(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handlePlusClick = () => {
    fileInputRef.current.click(); // 버튼 클릭 시 file input 클릭을 강제로 발생
  };

  // 파일 선택 시 미리보기 URL 생성
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]); // 기존 사진에 새 파일 추가
    // 같은 파일 다시 선택 가능하게 input 리셋
    e.target.value = "";
  };

  useEffect(() => {
    setSaveHandler(() => handleSubmit); // 저장 함수 등록
  }, [handleSubmit]);

  const removePhoto = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (!diary) return <p className={styles.loading}>불러오는 중...</p>;

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
            날짜 : {diary.created_at}
          </span>
          {diary.weather && (
            <span className={`${styles.metaTag} ${styles.weatherTag}`}>
              날씨 : {WEATHER_EMOJI[diary.weather] || ""} {diary.weather}
            </span>
          )}
        </div>

        <div className={styles.photoGrid}>
          {selectedFiles.map((file, index) => (
            <div key={index} className={styles.photoItem}>
              <img
                className={styles.photoImg}
                src={
                  typeof file === "string"
                    ? `http://localhost:5000/${file}`
                    : previewURLs[
                    index -
                    selectedFiles.filter(
                      (f) =>
                        typeof f === "string" &&
                        selectedFiles.indexOf(f) < index
                    ).length
                    ]
                }
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

          <button
            type="button"
            className={styles.addPhotoBtn}
            onClick={handlePlusClick}
          >
            <span className={styles.plusIcon}>+</span>
            사진 추가
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            ref={fileInputRef} // ref로 연결
            style={{ display: "none" }}
          />
        </div>
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