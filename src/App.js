import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MainPage from "./components/MainPage";
import "./App.css";
import { useTranslation } from "react-i18next";
import { Button } from "antd";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 32, // 這裡由 32 改成 140
        zIndex: 999,
        display: "flex",
        gap: 8,
      }}
    >
      <Button
        type={i18n.language === "zh" ? "primary" : "default"}
        shape="round"
        size="middle"
        style={ {
          fontWeight: 600,
          fontSize: 16,
          boxShadow: "0 2px 8px #eee",
        }}
        onClick={() => i18n.changeLanguage("zh")}
      >
        中文
      </Button>
      <Button
        type={i18n.language === "en" ? "primary" : "default"}
        shape="round"
        size="middle"
        style={{
          fontWeight: 600,
          fontSize: 16,
          boxShadow: "0 2px 8px #eee",
        }}
        onClick={() => i18n.changeLanguage("en")}
      >
        Eng
      </Button>
    </div>
  );
}

function App() {
  const [isLogin, setIsLogin] = useState(
    !!window.localStorage.getItem("jwtToken")
  );
  const [showRegister, setShowRegister] = useState(false);

  // 監聽 localStorage 變化（跨分頁同步）
  useEffect(() => {
    const onStorage = () => {
      setIsLogin(!!window.localStorage.getItem("jwtToken"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 只要 isLogin 變動就同步 localStorage 狀態
  useEffect(() => {
    const token = window.localStorage.getItem("jwtToken");
    if (isLogin && !token) setIsLogin(false);
    if (!isLogin && token) setIsLogin(true);
  }, [isLogin]);

  return (
    <div style={{ position: "relative" }}>
      <LanguageSwitcher />
      {!isLogin ? (
        showRegister ? (
          <RegisterForm
            onRegisterSuccess={() => setShowRegister(false)}
            onShowLogin={() => setShowRegister(false)} // 加這行
          />
        ) : (
          <LoginForm
            onLoginSuccess={() => setIsLogin(true)}
            onShowRegister={() => setShowRegister(true)}
          />
        )
      ) : (
        <MainPage setIsLogin={setIsLogin} />
      )}
    </div>
  );
}

export default App;