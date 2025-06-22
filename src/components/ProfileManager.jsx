import React, { useEffect, useState } from "react";
import Request, { checkPermission } from "../api/Request";
import { Form, Input, Button } from "antd";
import { useTranslation } from "react-i18next"; // 新增

const API_BASE = "back/public/index.php";

function ProfileForm({ initialData, onSubmit, onCancel }) {
  const { t } = useTranslation(); // 新增
  const [form] = Form.useForm();

  // 當 initialData 變動時重設表單
  useEffect(() => {
    form.resetFields();
  }, [initialData, form]);

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData || { id: "", password: "", email: "", name: "" }}
      onFinish={handleFinish}
      style={{ fontSize: 20 }}
    >
      <Form.Item label={t("account")} name="id">
        <Input maxLength={10} disabled />
      </Form.Item>
      <Form.Item
        label={t("password")}
        name="password"
        rules={[{ required: true, message: t("please_input_password") }]}
      >
        <Input maxLength={15} />
      </Form.Item>
      <Form.Item
        label={t("email")}
        name="email"
        rules={[{ required: true, message: t("please_input_email") }]}
      >
        <Input maxLength={50} />
      </Form.Item>
      <Form.Item
        label={t("user_name")}
        name="name"
        rules={[{ required: true, message: t("please_input_user_name") }]}
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ fontSize: 20, padding: "8px 32px", width: 120 }}>
          {t("submit")}
        </Button>
        <Button
          style={{ fontSize: 20, padding: "8px 32px", marginLeft: 16, width: 120 }}
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default function ProfileManager({ setIsLogin }) {
  const { t } = useTranslation(); // 新增
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("view");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const api = Request();

  // 取得個人資訊
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getProfile`);
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        setProfile(res.data.result[0]);
        setStatus("view");
        setMessage("");
      } else if (res.data.status === 403) {
        setMessage(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        setMessage(res.data.message || "取得資料失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // 更新個人資訊
  const handleUpdate = async (data) => {
    setLoading(true);
    try {
      const res = await api.post(
        `${API_BASE}?action=updateProfile`,
        new URLSearchParams({
          preid: profile.id,
          id: profile.id,
          password: data.password,
          email: data.email,
          name: data.name,
        })
      );
      if (res.data.status === 200) {
        if (window.localStorage) {
          window.localStorage.removeItem("jwtToken");
        }
        setMessage(`${res.data.message}，請重新登入`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (res.data.status === 403) {
        setMessage(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        setMessage(res.data.message || "更新失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 權限檢查後才能進入編輯
  const handleEditClick = async () => {
    try {
      const res = await checkPermission("updateProfile");
      if (res.data.status === 403) {
        setMessage(t("no_permission"));
        return;
      }
    } catch (err) {
      setMessage(t("no_permission"));
      return;
    }
    setStatus("edit");
  };

  // 刪除帳號前權限檢查
  const handleDelete = async () => {
    try {
      const res = await checkPermission("removeProfile");
      if (res.data.status === 403) {
        setMessage(t("no_permission"));
        return;
      }
    } catch (err) {
      setMessage(t("no_permission"));
      return;
    }
    if (!window.confirm(t("confirm_delete_user") || "確定要刪除帳號嗎？")) return;
    setLoading(true);
    try {
      const res = await api.post(`${API_BASE}?action=removeProfile`);
      if (res.data.status === 200) {
        alert(res.data.message);
        window.localStorage.removeItem("jwtToken");
        window.location.reload();
      } else if (res.data.status === 403) {
        setMessage(t("no_permission"));
      } else {
        setMessage(res.data.message || "刪除失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}
    >
      <div style={{ flex: 1, width: "100%" }}>
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              padding: "40px 48px",
              fontSize: 22,
              minHeight: 340,
            }}
          >
            <h2 style={{ fontSize: 32, marginBottom: 32 }}>{t("profile_info")}</h2>
            {message && (
              <div className="alert alert-info" style={{ fontSize: 20 }}>
                {message}
              </div>
            )}
            {status === "edit" && profile ? (
              <ProfileForm
                initialData={profile}
                onSubmit={handleUpdate}
                onCancel={() => setStatus("view")}
              />
            ) : (
              profile && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <b>{t("account")}：</b>
                    {profile.id}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <b>{t("user_name")}：</b>
                    {profile.name}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <b>{t("email")}：</b>
                    {profile.email}
                  </div>
                  <Button
                    type="primary"
                    onClick={handleEditClick} // 改成權限檢查版
                    size="large"
                    style={{ fontSize: 20, marginRight: 16 }}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      window.localStorage.removeItem("jwtToken");
                      window.location.reload();
                    }}
                    size="large"
                    style={{ fontSize: 20, marginRight: 16 }}
                  >
                    {t("logout")}
                  </Button>
                  <Button
                    danger
                    onClick={handleDelete} // 改成權限檢查版
                    size="large"
                    style={{ fontSize: 20, marginRight: 16 }}
                  >
                    {t("delete_account")}
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* 底部橫幅建議也用 t("address") 等詞條 */}
    </div>
  );
}