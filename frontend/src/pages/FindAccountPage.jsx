// FindAccountPage.jsx(아이디 • 비밀번호 찾기 페이지)

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./FindAccountPage.module.css";

export default function FindAccountPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("id"); // "id" | "password"

  // 아이디 찾기
  const [nickname, setNickname] = useState("");
  const [findEmail, setFindEmail] = useState("");
  const [foundId, setFoundId] = useState("");

  // 비밀번호 재설정
  const [userId, setUserId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/find-id", {
        nickname,
        email: findEmail,
      });
      setFoundId(res.data.userId);
    } catch (err) {
      alert("일치하는 회원 정보가 없습니다.");
      console.error(err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/verify-user", {
        userId,
        email: resetEmail,
      });
      setIsVerified(true);
    } catch (err) {
      alert("일치하는 회원 정보가 없습니다.");
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    try {
      await axios.post("/api/reset-password", {
        userId,
        email: resetEmail,
        newPassword,
      });
      alert("비밀번호가 변경되었습니다!");
      navigate("/login");
    } catch (err) {
      alert("비밀번호 변경 실패");
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "id" ? styles.tabActive : ""}`}
              onClick={() => setTab("id")}
            >
              아이디 찾기
            </button>
            <button
              className={`${styles.tab} ${tab === "password" ? styles.tabActive : ""}`}
              onClick={() => setTab("password")}
            >
              비밀번호 재설정
            </button>
          </div>

          {tab === "id" ? (
            <div className={styles.card}>
              <form onSubmit={handleFindId}>
                <p className={styles.fieldLabel}>닉네임</p>
                <input
                  className={styles.input}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                />
                <p className={styles.fieldLabel}>이메일</p>
                <input
                  className={styles.input}
                  value={findEmail}
                  onChange={(e) => setFindEmail(e.target.value)}
                  placeholder="가입 시 이메일을 입력하세요"
                />
                <button className={styles.primaryBtn} type="submit">
                  아이디 찾기
                </button>
              </form>

              {foundId && (
                <div className={styles.resultBox} style={{ marginTop: 20 }}>
                  <p className={styles.resultLabel}>회원님의 아이디는</p>
                  <p className={styles.resultValue}>{foundId}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.card}>
              {!isVerified ? (
                <form onSubmit={handleVerify}>
                  <p className={styles.fieldLabel}>아이디</p>
                  <input
                    className={styles.input}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                  />
                  <p className={styles.fieldLabel}>이메일</p>
                  <input
                    className={styles.input}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="가입 시 이메일을 입력하세요"
                  />
                  <button className={styles.primaryBtn} type="submit">
                    확인
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p className={styles.fieldLabel}>새 비밀번호</p>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <p className={styles.fieldLabel}>새 비밀번호 확인</p>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  <button className={styles.primaryBtn} type="submit">
                    비밀번호 변경
                  </button>
                </form>
              )}
            </div>
          )}

          <Link className={styles.backLink} to="/login">
            <span className={styles.backLinkHighlight}>로그인</span>으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}