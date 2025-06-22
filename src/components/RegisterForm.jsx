import React, { useState } from "react";
import Request from "../api/Request";
import { Form, Input, Button, Typography } from "antd";
import { useTranslation } from "react-i18next";
import LoginForm from "./LoginForm"; // 假設 LoginForm 在同一目錄下

const { Title, Text } = Typography;

const API_BASE = "back/public/index.php";

export default function RegisterForm({ onRegisterSuccess, onShowLogin }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [message, setMessage] = useState("");
  const api = Request();

  const handleFinish = async (values) => {
    setMessage("");
    const { id, password, email, name } = values;
    if (!id || !password || !email || !name) {
      setMessage(t("please_fill_all_fields"));
      return;
    }
    try {
      const res = await api.post(
        `${API_BASE}?action=registerUser`,
        new URLSearchParams(values)
      );
      const response = res.data;
      if (response.status === 200) {
        alert(t("register_success"));
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          window.location.href = "index.html";
        }
      } else {
        setMessage(t("error_prefix") + response.message);
      }
    } catch (err) {
      setMessage(t("error_prefix") + err);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setMessage("");
  };

  return (
    <div
      className="register-wrapper"
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
          <h2 style={{ marginBottom: 8 }}>{t("register_page")}</h2>
        </div>
      </div>

      {/* 註冊表單區塊 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
          <div className="register-card" style={{ background: "transparent", boxShadow: "none", padding: 0 }}>
            <Title level={3} className="register-title" style={{ textAlign: "center", color: "#4f46e5" }}>
              {t("register")}
            </Title>
            <div className="title-underline" />
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              style={{ width: 320, margin: "0 auto" }}
            >
              <Form.Item
                label={t("register_account")}
                name="id"
                rules={[{ required: true, message: t("please_fill_all_fields") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("register_password")}
                name="password"
                rules={[{ required: true, message: t("please_fill_all_fields") }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label={t("register_email")}
                name="email"
                rules={[{ required: true, message: t("please_fill_all_fields") }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("register_name")}
                name="name"
                rules={[{ required: true, message: t("please_fill_all_fields") }]}
              >
                <Input />
              </Form.Item>
              <div className="button-group" style={{ display: "flex", justifyContent: "space-between" }}>
                <Button onClick={handleReset} className="dark-button">
                  {t("clear")}
                </Button>
                <Button type="primary" htmlType="submit" className="dark-button" style={{ background: "#7c3aed", borderColor: "#7c3aed" }}>
                  {t("register")}
                </Button>
              </div>
            </Form>
            {/* 這裡直接呼叫 onShowLogin */}
            <div className="login-link" style={{ textAlign: "center", marginTop: 16 }}>
              <Text type="secondary">{t("already_have_account")}</Text>
              <Button type="link" onClick={onShowLogin} style={{ color: "#4f46e5", fontSize: 16, paddingLeft: 4 }}>
                {t("login")}
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