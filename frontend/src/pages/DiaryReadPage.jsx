// DiaryReadPage.jsx(일기 보는 페이지)

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./DiaryReadPage.module.css";
import { getDiaries } from "../utils/storage";

const WEATHER_EMOJI = {
  "맑음": "☀️",
  "구름 많음": "⛅",
  "흐림": "☁️",
  "비": "🌧️",
  "비/눈": "🌨️",
  "눈": "❄️",
};

export default function DiaryReadPage() {
  const { id } = useParams(); // 받아온 id
  const [diary, setDiary] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const fetchDiary = async () => {
      const token = sessionStorage.getItem("userToken");

      if (!token) {
        const diaries = getDiaries();
        const found = diaries.find((d) => String(d.id) === id);
        setDiary(found ? { ...found, photo_paths: [] } : null);
        return;
      }

      try {
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

  if (!diary) {
    return <p className={styles.loading}>로딩중입니다...</p>;
  }

  const hasPhotos = diary.photo_paths && diary.photo_paths.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.photoSide}>
        <h2 className={styles.title}>{diary.title}</h2>

        <div className={styles.metaRow}>
          <span className={`${styles.metaTag} ${styles.dateTag}`}>
            날짜 : {diary.created_at}
          </span>
          <span className={`${styles.metaTag} ${styles.weatherTag}`}>
            날씨 : {WEATHER_EMOJI[diary.weather] || ""} {diary.weather}
          </span>
        </div>

        {hasPhotos ? (
          <div className={styles.photoBox}>
            <img
              className={styles.photoImg}
              src={`http://localhost:5000/${diary.photo_paths[activePhoto]}`}
              alt="일기 사진"
            />
          </div>
        ) : (
          <div className={styles.noPhoto}>등록한 사진이 없습니다.</div>
        )}

        {hasPhotos && diary.photo_paths.length > 1 && (
          <div className={styles.photoThumbs}>
            {diary.photo_paths.map((path, index) => (
              <img
                key={index}
                className={`${styles.photoThumb} ${index === activePhoto ? styles.active : ""
                  }`}
                src={`http://localhost:5000/${path}`}
                alt={`사진 ${index + 1}`}
                onClick={() => setActivePhoto(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.contentSide}>
        <div className={styles.notebookLines} />
        <p className={styles.content}>{diary.content}</p>
      </div>
    </div>
  );
}