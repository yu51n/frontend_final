import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import Request from "../api/Request";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function LoginForm({ onLoginSuccess, onShowRegister }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [message, setMessage] = useState("");

  const api = Request();

  const handleFinish = async (values) => {
    setMessage("");
    try {
      const resp = await api.post(
        "back/public/index.php?action=doLogin",
        new URLSearchParams({ id: values.username, password: values.password })
      );
      const response = resp.data;
      if (response.status === 200) {
        if (window.localStorage) {
          window.localStorage.setItem("jwtToken", response.token);
        }
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setMessage(response.message || t("login_failed_wrong"));
      }
    } catch (err) {
      setMessage(t("login_failed_retry"));
    }
  };

  const handleReset = () => {
    form.resetFields();
    setMessage("");
  };

  return (
    <div
      className="login-wrapper"
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 上方橫幅 */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          borderRadius: 0,
          overflow: "hidden",
          height: 200,
          flexShrink: 0,
        }}
      >
        <img
          src="/banner.jpg"
          alt={t("banner_alt")}
          style={{
            width: "100vw",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(60%)",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            fontWeight: 600,
            fontSize: 24,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>{t("welcome_library_system")}</h2>
        </div>
      </div>

      {/* 登入表單區塊 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 灰色區塊包住登入卡片 */}
        <div
          style={{
            background: "rgba(142, 127, 150, 0.34)",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            padding: "48px 36px 36px 36px",
            minWidth: 380,
            maxWidth: "95vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="login-card" style={{ background: "transparent", boxShadow: "none", padding: 0 }}>
            <Title level={3} className="login-title" style={{ textAlign: "center", color: "#4f46e5" }}>
              {t("login")}
            </Title>
            <div className="title-underline" />
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              style={{ width: 320, margin: "0 auto" }}
            >
              <Form.Item
                label={t("account")}
                name="username"
                rules={[{ required: true, message: t("please_input_account") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("password")}
                name="password"
                rules={[{ required: true, message: t("please_input_password") }]}
              >
                <Input.Password />
              </Form.Item>
              <div className="button-group" style={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={handleReset} className="dark-button">
                  {t("clear")}
                </Button>
                <Button type="primary" htmlType="submit" className="dark-button" style={{ background: "#7c3aed", borderColor: "#7c3aed" }}>
                  {t("login")}
                </Button>
              </div>
            </Form>
            <div className="register-link" style={{ textAlign: "center", marginTop: 16 }}>
              <Text type="secondary">{t("no_account")}</Text>
              <Button type="link" onClick={onShowRegister} style={{ color: "#4f46e5", fontSize: 16, paddingLeft: 4 }}>
                {t("register")}
              </Button>
            </div>
            {message && (
              <div className="alert alert-danger mt-3 py-2 text-center" style={{ fontSize: 16 }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下方橫幅 */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(90deg,rgb(152, 122, 239) 0%,rgba(181, 113, 233, 0.8) 100%)",
          color: "white",
          textAlign: "left",
          padding: "24px 0 18px 0",
          fontWeight: 500,
          fontSize: 18,
          letterSpacing: 1,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {/* 地址 */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {t("address")}
            </div>
            <div
              style={{
                width: 260,
                height: 3,
                background: "white",
                opacity: 0.7,
                marginBottom: 14,
                borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 4 }}>
              {t("address_detail")}
            </div>
          </div>
          {/* 營業時間 */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {t("business_hours")}
            </div>
            <div
              style={{
                width: 260,
                height: 3,
                background: "white",
                opacity: 0.7,
                marginBottom: 14,
                borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 17 }}>
              {t("business_hours_detail")}
            </div>
          </div>
          {/* 聯絡我們 */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {t("contact_us")}
            </div>
            <div
              style={{
                width: 260,
                height: 3,
                background: "white",
                opacity: 0.7,
                marginBottom: 14,
                borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 17, whiteSpace: "pre-line" }}>
              {t("contact_detail")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}