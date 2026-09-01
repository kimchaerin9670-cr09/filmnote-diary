// Header.jsx(헤더부분)

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSaveHandler } from "../contexts/SaveContext";
import axios from "axios";

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
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowSettings((prev) => !prev)}>설정</button>
      {showSettings && (
        <div>
          {isLoggedIn ? (
            <button onClick={handleLogout}>로그아웃</button>
          ) : (
            <span>로그인이 필요합니다</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header>
      <div>
        <h1>로그</h1>
      </div>
      <div>
        {location.pathname === "/" ? (
          <div>
            <button>
              <Link to={"/diary/write"}>추가</Link>
            </button>
            {settingsButton}
          </div>
        ) : location.pathname.startsWith("/diary/read") ? (
          <div>
            <button onClick={handleUpdate}>수정</button>
            <button onClick={handleDelete}>삭제</button>
            <button>
              <Link to={"/"}>닫기</Link>
            </button>
          </div>
        ) : showSave ? (
          <div>
            <button onClick={saveHandler}>저장</button>
            <button>
              <Link to={"/"}>닫기</Link>
            </button>
          </div>
        ) : (
          <div>{settingsButton}</div>
        )}
      </div>
    </header>
  );
}
