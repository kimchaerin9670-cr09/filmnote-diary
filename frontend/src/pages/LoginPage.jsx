// LoginPage.jsx(로그인/익명(선택) 페이지)

import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // error 상태가 바뀔 때마다 콘솔로 확인
  useEffect(() => {
    console.log("에러 메시지 변경됨:", error);
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/login", {
        userId,
        password,
      });
      const token = res.data.token;

      // 로그인 성공 시 토큰을 받아 sessionStorage에 저장하여 홈 페이지로 이동할 수 있게 함
      sessionStorage.setItem("userToken", token);

      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("아이디나 비밀번호가 틀렸습니다.");
        alert("로그인 실패! 다시 시도해주세요");

        setUserId("");
        setPassword("");
      } else {
        setError("서버 오류가 발생했습니다.");
      }

      console.error(error);
    }
  };

  const handleAnonymous = () => {
    navigate("/anonymous");
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.subtitle}>오늘의 기억을 담아봐요</p>
          </div>

          <div className={styles.card}>
            <form onSubmit={handleLogin}>
              <div>
                <p className={styles.fieldLabel}>아이디</p>
                <input
                  className={styles.input}
                  type="text"
                  value={userId}
                  placeholder="아이디를 입력하세요"
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div>
                <p className={styles.fieldLabel}>비밀번호</p>
                <input
                  className={styles.input}
                  type="password"
                  value={password}
                  placeholder="비밀번호를 입력하세요"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className={styles.primaryBtn} type="submit">로그인</button>
            </form>

            <div className={styles.linkRow}>
              <Link to={"/find-account"}>아이디 · 비밀번호 찾기</Link>
              <Link className={styles.signupLink} to={"/signup"}>회원가입</Link>
            </div>
          </div>

          <div className={styles.divider}>
            <hr /><span>또는</span><hr />
          </div>

          <button className={styles.outlineBtn} onClick={handleAnonymous}>
            익명으로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
