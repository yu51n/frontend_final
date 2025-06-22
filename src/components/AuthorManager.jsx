import React, { useEffect, useState } from "react";
import Request, { checkPermission } from "../api/Request";
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const API_BASE = "back/public/index.php";

export default function AuthorManager({ setIsLogin }) {
  const { t } = useTranslation();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null: 新增, 物件: 編輯
  const [form] = Form.useForm();
  const [deleteId, setDeleteId] = useState(null);

  const api = Request();

  // 取得作者列表
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getAuthors`);
      if (res.data.status === 200) {
        setAuthors(res.data.result);
      } else if (res.data.status === 403) {
        message.error(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        message.error(res.data.message || "取得資料失敗");
      }
    } catch (err) {
      message.error(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuthors();
    // eslint-disable-next-line
  }, []);

  // 新增或編輯作者
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let res;
      if (editing) {
        res = await api.post(
          `${API_BASE}?action=updateAuthor&id=${editing.id}`,
          new URLSearchParams({
            name: values.name,
            birth: values.birth.format("YYYY-MM-DD"),
            region: values.region,
          })
        );
      } else {
        res = await api.post(
          `${API_BASE}?action=newAuthor`,
          new URLSearchParams({
            name: values.name,
            birth: values.birth.format("YYYY-MM-DD"),
            region: values.region,
          })
        );
      }
      if (res.data.status === 200) {
        message.success(res.data.message);
        setModalOpen(false);
        fetchAuthors();
      } else if (res.data.status === 403) {
        message.error(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        message.error(res.data.message || "操作失敗");
      }
    } catch (err) {
      message.error(`錯誤: ${err}`);
    }
    setLoading(false);
  };

  // 刪除作者
  const showDeleteModal = async (id) => {
    try {
      const res = await checkPermission("removeAuthor");
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    setDeleteId(id);
  };
  const handleDeleteOk = async () => {
    setLoading(true);
    try {
      const res = await api.post(`${API_BASE}?action=removeAuthor&id=${deleteId}`);
      if (res.data.status === 200) {
        message.success(res.data.message);
        fetchAuthors();
      } else if (res.data.status === 403) {
        message.error(t("no_permission"));
        // 可選：setIsLogin(false);
      } else {
        message.error(res.data.message || t("delete_failed"));
      }
    } catch (err) {
      message.error(`${t("error_prefix")}${err}`);
    }
    setLoading(false);
    setDeleteId(null);
  };

  // 新增/編輯按鈕
  const openModal = async (record = null) => {
    // 權限檢查
    const action = record ? "updateAuthor" : "newAuthor";
    try {
      const res = await checkPermission(action);
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    setEditing(record);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue({
        name: record.name,
        birth: dayjs(record.birth),
        region: record.region,
      });
    } else {
      form.resetFields();
    }
  };

  // 表格欄位
  const columns = [
    { title: t("id"), dataIndex: "id", key: "id", width: 80 },
    { title: t("author_name"), dataIndex: "name", key: "name" },
    { title: t("birth"), dataIndex: "birth", key: "birth" },
    { title: t("region"), dataIndex: "region", key: "region" },
    {
      title: t("action"),
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            {t("edit")}
          </Button>
          <Button danger onClick={() => showDeleteModal(record.id)}>
            {t("delete")}
          </Button>
        </Space>
      ),
    },
  ];

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 32 }}>{t("author_manage")}</h2>
            <Button type="primary" onClick={() => openModal()} size="large" style={{ fontSize: 20 }}>
              {t("add_author")}
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={authors}
            rowKey="id"
            loading={loading}
            bordered
            pagination={{ pageSize: 8 }}
            style={{
              fontSize: 20,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
            components={{
              body: {
                cell: (props) => (
                  <td {...props} style={{ ...props.style, fontSize: 20, padding: 16 }} />
                ),
              },
              header: {
                cell: (props) => (
                  <th {...props} style={{ ...props.style, fontSize: 22, padding: 18, background: "#f5f5fa" }} />
                ),
              },
            }}
          />

          <Modal
            title={editing ? t("edit_author") : t("add_author")}
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={null}
            destroyOnClose
            width={800}
            bodyStyle={{ padding: 48 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={editing ? {
                name: editing.name,
                birth: editing.birth ? dayjs(editing.birth) : null,
                region: editing.region,
              } : {}}
            >
              <Form.Item
                label={t("author_name")}
                name="name"
                rules={[{ required: true, message: t("please_input_name") }]}
              >
                <Input maxLength={10} />
              </Form.Item>
              <Form.Item
                label={t("birth")}
                name="birth"
                rules={[{ required: true, message: t("please_select_birth") }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label={t("region")}
                name="region"
                rules={[{ required: true, message: t("please_input_region") }]}
              >
                <Input maxLength={10} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                  {t("submit")}
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={!!deleteId}
            onCancel={() => setDeleteId(null)}
            onOk={handleDeleteOk}
            okText={t("delete")}
            cancelText={t("cancel")}
            okType="danger"
          >
            {t("confirm_delete_author")}
          </Modal>
        </div>
      </div>

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
          zIndex: 10, // 降低底部橫幅層級
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
            <div style={{ fontSize: 17 }}>
              {t("contact_detail")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}