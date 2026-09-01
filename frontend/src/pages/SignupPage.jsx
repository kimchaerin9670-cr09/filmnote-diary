// SignupPage.jsx(회원가입 페이지)

import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import styles from "./SignupPage.module.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: "",
    userId: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [isIdChecked, setIsIdChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 이메일 정규식
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // 비밀번호 정규식 (8~12자, 영어 + 숫자 + 특수문자)
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    return regex.test(password);
  };

  // 아이디 중복체크
  const checkDuplicate = async () => {
    if (!formData.userId) {
      alert("아이디를 입력해주세요!");
      return;
    }

    try {
      const res = await axios.post("/api/check-userId", {
        userId: formData.userId,
      });
      if (res.data.available) {
        alert("사용 가능한 아이디입니다.");
        setIsIdChecked(true);
      } else {
        alert("이미 사용 중인 아이디입니다.");
        setIsIdChecked(false);
      }
    } catch (err) {
      console.error(err);
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!isIdChecked) {
      alert("아이디 중복 확인을 먼저 해주세요!");
      return;
    }
    if (!validateEmail(formData.email)) {
      alert("이메일 형식이 올바르지 않습니다!");
      return;
    }
    if (!validatePassword(formData.password)) {
      alert(
        "비밀번호는 8~12자, 영어 + 숫자 + 특수문자를 모두 포함해야 합니다!"
      );
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const res = await axios.post("/api/signup", formData);
      if (res.data.success) {
        alert("회원가입 완료!");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert("회원가입 실패");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Sign up</h1>
            <p className={styles.subtitle}>나만의 일기를 시작해요</p>
          </div>

          <div className={styles.card}>
            <form onSubmit={handleSignup}>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>닉네임</p>
                <input
                  className={styles.input}
                  name="nickname"
                  placeholder="닉네임"
                  value={formData.nickname}
                  onChange={handleChange}
                  disabled={isIdChecked}
                />
              </div>

              <div className={styles.field}>
                <p className={styles.fieldLabel}>아이디</p>
                <div className={styles.idRow}>
                  <input
                    className={styles.input}
                    name="userId"
                    placeholder="아이디"
                    value={formData.userId}
                    onChange={handleChange}
                    disabled={isIdChecked}
                  />
                  <button className={styles.checkBtn} type="button" onClick={checkDuplicate}>
                    중복 확인
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <p className={styles.fieldLabel}>비밀번호</p>
                <input
                  className={styles.input}
                  name="password"
                  type="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <p className={styles.fieldLabel}>비밀번호 확인</p>
                <input
                  className={styles.input}
                  name="passwordConfirm"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <p className={styles.fieldLabel}>이메일</p>
                <input
                  className={styles.input}
                  name="email"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <button className={styles.primaryBtn} type="submit">회원가입</button>
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
