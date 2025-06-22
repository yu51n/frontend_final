import React, { useEffect, useState } from "react";
import Request, { checkPermission } from "../api/Request";
import { Button, message as antdMessage } from "antd"; // 改名為 antdMessage
import { useTranslation } from "react-i18next"; // 新增

const API_BASE = "back/public/index.php";

function CategoryForm({ initialData, onSubmit, onCancel }) {
  const { t } = useTranslation(); // 新增
  const [name, setName] = useState(initialData ? initialData.name : "");

  useEffect(() => {
    setName(initialData ? initialData.name : "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontSize: 22 }}>
      {initialData && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 600 }}>{t("id")}：</span>
          <label style={{ fontSize: 22 }}>{initialData.id}</label>
        </div>
      )}
      <label style={{ fontSize: 22, marginRight: 8 }}>{t("category_name")}：</label>
      <input
        type="text"
        style={{
          width: 300,
          fontSize: 22,
          display: "inline-block",
          marginBottom: 16,
        }}
        name="name"
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div style={{ marginTop: 32, textAlign: "right" }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ fontSize: 20, padding: "8px 32px" }}
        >
          {t("submit")}
        </Button>
        <Button
          style={{ fontSize: 20, padding: "8px 32px", marginLeft: 16 }}
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

export default function CategoryManager({ setIsLogin }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [infoMessage, setInfoMessage] = useState(""); // 改名

  const api = Request();

  // 取得分類
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getCategories`);
      if (res.data.status === 200) {
        setCategories(res.data.result);
        setInfoMessage("");
      } else if (res.data.status === 403) {
        setInfoMessage(t("no_permission"));
      } else {
        setInfoMessage(res.data.message || "取得資料失敗");
      }
    } catch (err) {
      setInfoMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  // 新增或編輯
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let res;
      if (editing) {
        res = await api.post(
          `${API_BASE}?action=updateCategory&id=${editing.id}`,
          new URLSearchParams({ name: values.name })
        );
      } else {
        res = await api.post(
          `${API_BASE}?action=newCategory`,
          new URLSearchParams({ name: values.name })
        );
      }
      if (res.data.status === 200) {
        setInfoMessage(res.data.message);
        setModalOpen(false);
        fetchCategories();
      } else if (res.data.status === 403) {
        setInfoMessage(t("no_permission"));
      } else {
        setInfoMessage(res.data.message || "操作失敗");
      }
    } catch (err) {
      setInfoMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 刪除分類前權限檢查
  const handleDelete = async (id) => {
    try {
      const res = await checkPermission("removeCategory");
      if (res.data.status === 403) {
        antdMessage.error(t("no_permission")); // 用 antdMessage
        return;
      }
    } catch (err) {
      antdMessage.error(t("no_permission"));
      return;
    }
    if (!window.confirm(t("confirm_delete_category"))) return;
    setLoading(true);
    try {
      const res = await api.post(`${API_BASE}?action=removeCategory&id=${id}`);
      if (res.data.status === 200) {
        setInfoMessage(res.data.message);
        fetchCategories();
      } else if (res.data.status === 403) {
        antdMessage.error(t("no_permission"));
      } else {
        setInfoMessage(res.data.message || t("delete_failed"));
      }
    } catch (err) {
      setInfoMessage(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 開啟 modal（新增/編輯前權限檢查）
  const openModal = async (record = null) => {
    const action = record ? "updateCategory" : "newCategory";
    try {
      const res = await checkPermission(action);
      if (res.data.status === 403) {
        antdMessage.error(t("no_permission"));
        return;
      }
    } catch (err) {
      antdMessage.error(t("no_permission"));
      return;
    }
    setEditing(record);
    setModalOpen(true);
  };

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
            <h2 style={{ margin: 0, fontSize: 32 }}>{t("category_manage")}</h2>
            <Button
              type="primary"
              onClick={() => openModal()}
              size="large"
              style={{ fontSize: 20 }}
            >
              {t("add_category")}
            </Button>
          </div>
          {infoMessage && (
            <div className="alert alert-info mt-2" style={{ fontSize: 20 }}>
              {infoMessage}
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
                <th style={{ padding: 18, textAlign: "left" }}>{t("id")}</th>
                <th style={{ padding: 18, textAlign: "left" }}>{t("category_name")}</th>
                <th style={{ padding: 18, textAlign: "right" }}>{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: 16 }}>{c.id}</td>
                  <td style={{ padding: 16 }}>{c.name}</td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <Button
                      type="primary"
                      onClick={() => openModal(c)}
                      style={{ fontSize: 18, marginRight: 8 }}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      danger
                      onClick={() => handleDelete(c.id)}
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

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 40,
              minWidth: 400,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ fontSize: 28, marginBottom: 24 }}>
              {editing ? t("edit_category") : t("add_category")}
            </h3>
            <CategoryForm
              initialData={editing}
              onSubmit={(values) => handleFinish(values)}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 底部橫幅 */}
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
    </div>
  );
}