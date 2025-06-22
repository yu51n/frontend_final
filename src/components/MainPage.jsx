import React, { useState } from "react";
import AuthorManager from "./AuthorManager";
import CategoryManager from "./CategoryManager";
import BookManager from "./BookManager";
import UserManager from "./UserManager";
import ProfileManager from "./ProfileManager";
import {
  BookOutlined,
  TagsOutlined,
  UserOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useTranslation } from "react-i18next"; // 新增

const { Header } = Layout;

export default function MainPage({ setIsLogin }) {
  const { t } = useTranslation(); // 新增
  const [page, setPage] = useState("home");

  let content;
  switch (page) {
    case "profile":
      content = <ProfileManager setIsLogin={setIsLogin} />;
      break;
    case "authors":
      content = <AuthorManager setIsLogin={setIsLogin} />;
      break;
    case "books":
      content = <BookManager setIsLogin={setIsLogin} />;
      break;
    case "categories":
      content = <CategoryManager setIsLogin={setIsLogin} />;
      break;
    case "users":
      content = <UserManager setIsLogin={setIsLogin} />;
      break;
    default:
      content = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>
            {t("welcome_library_system")}
          </h2>
          <h3 style={{ fontSize: 28, marginBottom: 16 }}>
            {t("library_address")}
          </h3>
          <h4 style={{ fontSize: 24, marginBottom: 12 }}>
            {t("library_hours")}
          </h4>
          <p style={{ fontSize: 22 }}>{t("please_select_info")}</p>
        </div>
      );
  }

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center", background: "rgb(126, 76, 155)" }}>
        <div style={{ color: "white", fontSize: 28, fontWeight: 700, marginRight: 40 }}>
          📚 {t("library_system_title")}
        </div>
        <Menu
          mode="horizontal"
          theme="dark"
          selectable={false}
          style={{
            flex: 1,
            background: "rgb(126, 76, 155)",
            display: "flex",
            fontSize: 20,
            height: 56,
            alignItems: "center",
          }}
        >
          <Menu.Item
            key="authors"
            icon={<UserOutlined style={{ fontSize: 22 }} />}
            onClick={() => setPage("authors")}
            style={{ height: 56, display: "flex", alignItems: "center" }}
          >
            {t("menu_authors")}
          </Menu.Item>
          <Menu.Item
            key="books"
            icon={<BookOutlined style={{ fontSize: 22 }} />}
            onClick={() => setPage("books")}
            style={{ height: 56, display: "flex", alignItems: "center" }}
          >
            {t("menu_books")}
          </Menu.Item>
          <Menu.Item
            key="categories"
            icon={<TagsOutlined style={{ fontSize: 22 }} />}
            onClick={() => setPage("categories")}
            style={{ height: 56, display: "flex", alignItems: "center" }}
          >
            {t("menu_categories")}
          </Menu.Item>
          <Menu.Item
            key="users"
            icon={<TeamOutlined style={{ fontSize: 22 }} />}
            onClick={() => setPage("users")}
            style={{ height: 56, display: "flex", alignItems: "center" }}
          >
            {t("menu_users")}
          </Menu.Item>
          <Menu.Item
            key="profile"
            icon={<InfoCircleOutlined style={{ fontSize: 22 }} />}
            onClick={() => setPage("profile")}
            style={{
              marginLeft: "auto",
              height: 56,
              right: 150,
              display: "flex",
              alignItems: "center",
            }}
          >
            {t("menu_profile")}
          </Menu.Item>
        </Menu>
      </Header>
      <div style={{ padding: 0 }}>{content}</div>
    </Layout>
  );
}