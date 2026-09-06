// Header.jsx(헤더부분)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSaveHandler } from "../contexts/SaveContext";
import axios from "axios";
import styles from "./Header.module.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveHandler } = useSaveHandler(); // 저장 함수 가져오기

  const [showSettings, setShowSettings] = useState(false); // 설정 드롭다운 열림/닫힘

  // 로그인 상태 판단 (실제 로그인 토큰 또는 익명 세션)
  const hasToken = !!sessionStorage.getItem("userToken");
  const hasAnonymous = !!localStorage.getItem("anonymousNickname");
  const isLoggedIn = hasToken || hasAnonymous;

  const showSave =
    location.pathname.startsWith("/diary/write") ||
    location.pathname.startsWith("/diary/update");

  // 직접 파싱
  const pathSegments = location.pathname.split("/");
  let diaryId = null;
  if (pathSegments[1] === "diary" && pathSegments[2] === "read") {
    diaryId = pathSegments[3];
  }

  // console.log(diaryId);

  // 일기 수정 페이지로 이동
  const handleUpdate = () => {
    if (diaryId) {
      navigate(`/diary/update/${diaryId}`);
    }
  };

  // 일기 삭제 페이지로 이동
  const handleDelete = () => {
    if (diaryId) {
      navigate(`/diary/delete/${diaryId}`);
    }
  };

  // 로그아웃: 실제 로그인 사용자는 토큰 제거, 익명 사용자는 데이터 그대로 두고 화면만 이동
  const handleLogout = () => {
    if (hasToken) {
      sessionStorage.removeItem("userToken");
    }
    setShowSettings(false);
    navigate("/login");
  };

  // console.log(location.pathname);

  // 설정 버튼 + 드롭다운 (여러 분기에서 재사용)
  const settingsButton = (
    <div className={styles.settingsWrapper}>
      <button className={styles.circleBtn} onClick={() => setShowSettings((prev) => !prev)}>
        설정
      </button>
      {showSettings && (
        <div className={styles.settingsMenu}>
          {isLoggedIn ? (
            <button onClick={handleLogout}>로그아웃</button>
          ) : (
            <span>로그인이 필요합니다</span>
          )}
        </div>
      )}
    </div>
  );

  const hideHeaderPaths = ["/login", "/signup", "/anonymous"];
  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>📸 필름노트</Link>
      <div className={styles.buttonGroup}>
        {location.pathname === "/" ? (
          <>
            <button className={`${styles.circleBtn} ${styles.primary}`}>
              <Link to={"/diary/write"} style={{ color: "inherit", textDecoration: "none" }}>
                + 추가
              </Link>
            </button>
            {settingsButton}
          </>
        ) : location.pathname.startsWith("/diary/read") ? (
          <>
            <button className={styles.circleBtn} onClick={handleUpdate}>수정</button>
            <button className={styles.circleBtn} onClick={handleDelete}>삭제</button>
            <button className={styles.circleBtn}>
              <Link to={"/"} style={{ color: "inherit", textDecoration: "none" }}>닫기</Link>
            </button>
          </>
        ) : showSave ? (
          <>
            <button className={`${styles.circleBtn} ${styles.primary}`} onClick={saveHandler}>저장</button>
            <button className={styles.circleBtn}>
              <Link to={"/"} style={{ color: "inherit", textDecoration: "none" }}>닫기</Link>
            </button>
          </>
        ) : (
          settingsButton
        )}
      </div>
    </header>
  );
}