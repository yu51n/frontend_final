import axios from "axios";

const baseURL = "http://localhost/frontend/";
const API_BASE = "back/public/index.php"; // 新增這行

export default function Request() {
  const jwtToken = window.localStorage.getItem("jwtToken");
  return axios.create({
    baseURL,
    headers: jwtToken ? { Authorization: jwtToken } : {},
  });
}

export const checkPermission = async (action) => {
  return axios.get(`${baseURL}${API_BASE}?action=${action}`);
};