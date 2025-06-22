import React, { useEffect, useState } from "react";
import Request, { checkPermission } from "../api/Request";
import { Button, Form, Input, message } from "antd"; // 加入 message
import { useTranslation } from "react-i18next"; // 新增

const API_BASE = "back/public/index.php";

function UserForm({ initialData, onSubmit, onCancel }) {
  const { t } = useTranslation(); // 新增
  const [form] = Form.useForm();

  // 當 initialData 變動時重設表單
  React.useEffect(() => {
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
      <Form.Item
        label={t("account")}
        name="id"
        rules={[{ required: true, message: t("please_input_account") }]}
      >
        <Input maxLength={10} disabled={!!initialData} />
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

export default function UserManager({ setIsLogin }) {
  const { t } = useTranslation(); // 新增
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("list"); // list | new | edit
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const api = Request();

  // 取得使用者列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getUsers`);
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        setUsers(res.data.result);
        setStatus("list");
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
    if (status === "list") fetchUsers();
    // eslint-disable-next-line
  }, [status]);

  // 新增使用者
  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const res = await api.post(
        `${API_BASE}?action=newUser`,
        new URLSearchParams(data)
      );
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        setMessage(res.data.message);
        setStatus("list");
      } else if (res.data.status === 403) {
        setMessage(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        setMessage(res.data.message || "新增失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 權限檢查後才能進入新增
  const handleNewClick = async () => {
    try {
      const res = await checkPermission("newUser");
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    setStatus("new");
  };

  // 編輯使用者（權限檢查）
  const handleEdit = async (id) => {
    try {
      const res = await checkPermission("updateUser");
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getUsers&id=${id}`);
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        const user = res.data.result[0];
        setEditData({
          preid: user.id,
          id: user.id,
          password: user.password,
          email: user.email,
          name: user.name,
        });
        setStatus("edit");
        setMessage("");
      } else if (res.data.status === 403) {
        message.error(t("no_permission"));
      } else {
        setMessage(res.data.message || "取得資料失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 更新使用者
  const handleUpdate = async (data) => {
    setLoading(true);
    try {
      const res = await api.post(
        `${API_BASE}?action=updateUser&id=${editData.id}`,
        new URLSearchParams({
          preid: editData.preid,
          id: editData.id,
          password: data.password,
          email: data.email,
          name: data.name,
        })
      );
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        setMessage(res.data.message);
        setStatus("list");
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

  // 刪除使用者（權限檢查）
  const handleDelete = async (id) => {
    try {
      const res = await checkPermission("removeUser");
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    if (!window.confirm(t("confirm_delete_user") || "確定要刪除嗎？")) return;
    setLoading(true);
    try {
      const res = await api.post(
        `${API_BASE}?action=removeUser&id=${id}`
      );
      if (res.data.status === 200) {
        if (window.localStorage && res.data.token) {
          window.localStorage.setItem("jwtToken", res.data.token);
        }
        setMessage(res.data.message);
        setStatus("list");
      } else if (res.data.status === 403) {
        message.error(t("no_permission"));
      } else {
        setMessage(res.data.message || "刪除失敗");
      }
    } catch (err) {
      setMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 畫面渲染
  if (loading) return <div>載入中...</div>;

  // 新增/編輯表單
  if (status === "new" || (status === "edit" && editData))
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
              <h2 style={{ fontSize: 32, marginBottom: 32 }}>
                {status === "new" ? t("add_user") : t("edit_user")}
              </h2>
              <UserForm
                initialData={status === "edit" ? editData : undefined}
                onSubmit={status === "new" ? handleCreate : handleUpdate}
                onCancel={() => setStatus("list")}
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );

  // 列表畫面
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
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 32 }}>{t("user_manage")}</h2>
            {/* 新增按鈕 */}
            <Button
              type="primary"
              onClick={handleNewClick}
              size="large"
              style={{ fontSize: 20 }}
            >
              {t("add_user")}
            </Button>
          </div>
          {message && (
            <div className="alert alert-info mt-2" style={{ fontSize: 20 }}>
              {message}
            </div>
          )}
          <table
            className="table table-bordered mt-2"
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              fontSize: 20,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ fontSize: 22, background: "#f5f5fa" }}>
                <th style={{ padding: 18, textAlign: "left" }}>{t("account")}</th>
                <th style={{ padding: 18, textAlign: "left" }}>{t("password")}</th>
                <th style={{ padding: 18, textAlign: "left" }}>{t("email")}</th>
                <th style={{ padding: 18, textAlign: "left" }}>{t("user_name")}</th>
                <th style={{ padding: 18, textAlign: "left" }}>{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 16 }}>{u.id}</td>
                  <td style={{ padding: 16 }}>{u.password}</td>
                  <td style={{ padding: 16 }}>{u.email}</td>
                  <td style={{ padding: 16 }}>{u.name}</td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    {/* 編輯、刪除按鈕 */}
                    <Button
                      type="primary"
                      onClick={() => handleEdit(u.id)}
                      style={{ fontSize: 18, marginRight: 8 }}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      danger
                      onClick={() => handleDelete(u.id)}
                      style={{ fontSize: 18 }}
                    >
                      {t("delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// 底部橫幅元件
function Footer() {
  const { t } = useTranslation(); // 新增
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        background: "linear-gradient(90deg,rgb(152, 122, 239) 0%,rgba(181, 113, 233, 0.8) 100%)",
        color: "white",
        textAlign: "left",
        padding: "24px 0 18px 0",
        fontWeight: 500,
        fontSize: 18,
        letterSpacing: 1,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
          padding: "0 40px",
          boxSizing: "border-box",
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
            高雄市燕巢區深中路58號
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
            （一）~（六）10:00~21:00
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
          <div style={{ fontSize: 17 }}>
            電話：+886-123-456-789 <br />
            信箱：support@nkust.edu.tw
          </div>
        </div>
      </div>
    </div>
  );
}