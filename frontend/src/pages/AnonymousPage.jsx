// AnonymousPage.jsx(익명 시작 페이지)

import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import styles from "./AnonymousPage.module.css";

export default function AnonymousPage() {
  const navigate = useNavigate();
  const [anonymousNickname, setAnonymousNickname] = useState("");

  const handleAnonymousJoin = async (e) => {
    e.preventDefault();

    if (anonymousNickname.trim() === "") {
      alert("닉네임을 입력해주세요!");
      return;
    }

    localStorage.setItem("anonymousNickname", anonymousNickname);

    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Anonymous</h1>
            <p className={styles.subtitle}>닉네임만으로 가볍게 시작해요</p>
          </div>

          <div className={styles.card}>
            <form onSubmit={handleAnonymousJoin}>
              <p className={styles.fieldLabel}>닉네임</p>
              <input
                className={styles.input}
                type="text"
                value={anonymousNickname}
                placeholder="사용하실 닉네임을 입력하세요"
                onChange={(e) => setAnonymousNickname(e.target.value)}
              />
              <button className={styles.primaryBtn} type="submit">
                시작하기
              </button>
            </form>
          </div>

          <p className={styles.bottomText}>
            이미 계정이 있으신가요?{" "}
            <Link className={styles.loginLink} to={"/login"}>로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
