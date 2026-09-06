// DiaryListPage.jsx(일기장 목록 페이지 - 홈 페이지)

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getDiaries } from "../utils/storage";
import styles from "./DiaryListPage.module.css";

export default function DiaryListPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState([]);

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        const res = await axios.get("/api/userinfo", {
          // 토큰을 보내는 표준적인 방식(Authorization라는 HTTP 표준 헤더에 Bearer {token} 이라는 형태로 내가 로그인해서 받은 JWT 토큰을 담아서 보냄)
          headers: { Authorization: `Bearer ${token}` },
        });

        setNickname(res.data.nickname);
        setEmail(res.data.email);
      } catch (e) {
        // 로그인 사용자가 아니거나(익명 사용자거나), 서버 요청이 실패하면
        const anonymousNickname = localStorage.getItem("anonymousNickname");

        if (anonymousNickname) {
          setNickname(anonymousNickname);
        } else {
          console.error(e);
        }
      }
    };

    const fetchDiaryContent = async () => {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        const anonymousDiaries = getDiaries();
        if (anonymousDiaries) {
          setDiaries(anonymousDiaries);
        } else {
          setDiaries(null);
        }
        return;
      }

      try {
        const res = await axios.get("/api/diaryinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDiaries(res.data.contents);
        console.log(res.data.contents);
      } catch (e) {
        console.error(e);
        setDiaries(null);
      }
    };

    fetchNickname();
    fetchDiaryContent();
  }, []);

  const handleAdd = () => {
    navigate("/diary/write");
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.photoCard}>
          <div className={styles.photoBox}>원하는 사진 첨부</div>
          <div className={styles.stamp}>
            <p className={styles.stampText}>' 필름노트 '</p>
          </div>
        </div>

        <div className={styles.nicknameBlock}>
          <p className={styles.nickname}>{nickname}님</p>
        </div>

        {email && <p className={styles.handle}>@{email.split("@")[0]}</p>}

        <div className={styles.divider} />

        <div className={styles.countBox}>
          <span className={styles.countLabel}>일기</span>
          <span className={styles.countValue}>{diaries ? diaries.length : 0}</span>
        </div>
      </aside>

      <div className={styles.feed}>
        <p className={styles.feedHeader}>
          <span>나의 일기</span>
          <span className={styles.feedSub}>총 {diaries ? diaries.length : 0}개</span>
        </p>

        {diaries && diaries.length > 0 ? (
          <ul className={styles.entryList}>
            {diaries.map((item) => (
              <li key={item.id} className={styles.entryItem}>
                <Link className={styles.entryLink} to={`/diary/read/${item.id}`}>
                  <div className={styles.entryThumb} />
                  <div className={styles.entryBody}>
                    <div className={styles.entryTop}>
                      <h4 className={styles.entryTitle}>{item.title}</h4>
                      <small className={styles.entryDate}>{item.created_at}</small>
                    </div>
                    <p className={styles.entryExcerpt}>{item.content}...</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>+버튼을 눌러 일기를 추가할 수 있습니다</p>
            <button className={styles.addBtn} onClick={handleAdd}>+ 일기 쓰기</button>
          </div>
        )}
      </div>
    </div>
  );
}