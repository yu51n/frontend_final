import React, { useEffect, useState } from "react";
import Request, { checkPermission } from "../api/Request";
import { Table, Button, Modal, Form, Input, Select, Checkbox, message, Space } from "antd";
import { useTranslation } from "react-i18next"; // 新增

const API_BASE = "back/public/index.php";

export default function BookManager({ setIsLogin }) {
  const { t } = useTranslation(); // 新增
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null: 新增, 物件: 編輯
  const [form] = Form.useForm();

  const api = Request();

  // 取得作者與分類
  const fetchAuthorsAndCategories = async () => {
    try {
      const [authorRes, categoryRes] = await Promise.all([
        api.get(`${API_BASE}?action=getAuthors`),
        api.get(`${API_BASE}?action=getCategories`),
      ]);
      if (authorRes.data.status === 200) setAuthors(authorRes.data.result);
      if (categoryRes.data.status === 200) setCategories(categoryRes.data.result);
    } catch (err) {
      message.error(`取得作者/分類失敗: ${err}`);
    }
  };

  // 取得書籍列表
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_BASE}?action=getBooks`);
      if (res.data.status === 200) {
        setBooks(res.data.result.books);
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
    fetchAuthorsAndCategories();
    fetchBooks();
    // eslint-disable-next-line
  }, []);

  // 新增或編輯書籍
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let res;
      if (editing) {
        res = await api.post(
          `${API_BASE}?action=updateBook&id=${editing.id}`,
          new URLSearchParams({
            preid: editing.id,
            id: values.id,
            title: values.title,
            author_id: values.author_id,
            categories: values.categories,
          })
        );
      } else {
        res = await api.post(
          `${API_BASE}?action=newBook`,
          new URLSearchParams({
            id: values.id,
            title: values.title,
            author_id: values.author_id,
            categories: values.categories,
          })
        );
      }
      if (res.data.status === 200) {
        message.success(res.data.message);
        setModalOpen(false);
        fetchBooks();
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

  // 開啟新增/編輯 Modal（權限檢查）
  const openModal = async (record = null) => {
    const action = record ? "updateBook" : "newBook";
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
        id: record.id,
        title: record.title,
        author_id: String(record.author_id),
        categories: Array.isArray(record.categories)
          ? record.categories.map((c) => String(c.id))
          : [],
      });
    } else {
      form.resetFields();
    }
  };

  // 刪除書籍（權限檢查）
  const handleDelete = async (id) => {
    try {
      const res = await checkPermission("removeBook");
      if (res.data.status === 403) {
        message.error(t("no_permission"));
        return;
      }
    } catch (err) {
      message.error(t("no_permission"));
      return;
    }
    Modal.confirm({
      title: t("confirm_delete_book"),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        setLoading(true);
        try {
          const res = await api.post(`${API_BASE}?action=removeBook&id=${id}`);
          if (res.data.status === 200) {
            message.success(res.data.message);
            fetchBooks();
          } else if (res.data.status === 403) {
            message.error(t("no_permission"));
          } else {
            message.error(res.data.message || t("delete_failed"));
          }
        } catch (err) {
          message.error(`錯誤: ${err}`);
        }
        setLoading(false);
      },
    });
  };

  // 表格欄位
  const columns = [
    { title: t("id"), dataIndex: "id", key: "id", width: 80 },
    { title: t("book_title"), dataIndex: "title", key: "title" },
    { title: t("author"), dataIndex: "name", key: "name" },
    {
      title: t("category"),
      dataIndex: "categories",
      key: "categories",
      render: (categories) => {
        if (Array.isArray(categories) && categories.length > 0) {
          // 陣列且有 name 屬性
          if (typeof categories[0] === "object" && categories[0].name) {
            return categories.map((c) => c.name).join(", ");
          }
          // 陣列但元素是字串
          return categories.join(", ");
        }
        // 字串
        if (typeof categories === "string") return categories;
        return "";
      },
    },
    {
      title: t("action"),
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            {t("edit")}
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 32 }}>{t("book_manage")}</h2>
            <Button type="primary" onClick={() => openModal()} size="large" style={{ fontSize: 20 }}>
              {t("add_book")}
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={books}
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
            title={editing ? t("edit_book") : t("add_book")}
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={null}
            destroyOnClose
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={editing ? {
                id: editing.id,
                title: editing.title,
                author_id: String(editing.author_id),
                categories: Array.isArray(editing.categories)
                  ? editing.categories.map((c) => String(c.id))
                  : [],
              } : {}}
            >
              <Form.Item
                label="ID"
                name="id"
                rules={[{ required: true, message: t("please_input_id") }]}
              >
                <Input maxLength={11} disabled={!!editing} />
              </Form.Item>
              <Form.Item
                label={t("book_title")}
                name="title"
                rules={[{ required: true, message: t("please_input_title") }]}
              >
                <Input maxLength={30} />
              </Form.Item>
              <Form.Item
                label={t("author")}
                name="author_id"
                rules={[{ required: true, message: t("please_select_author") }]}
              >
                <Select>
                  {authors.map((a) => (
                    <Select.Option key={a.id} value={String(a.id)}>
                      {a.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={t("category")}
                name="categories"
                rules={[{ required: true, message: t("please_select_category") }]}
              >
                <Checkbox.Group style={{ width: "100%" }}>
                  <Space>
                    {categories.map((c) => (
                      <Checkbox key={c.id} value={String(c.id)}>
                        {c.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                  {t("submit")}
                </Button>
              </Form.Item>
            </Form>
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
              地址
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
              營業時間
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
              聯絡我們
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