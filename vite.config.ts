import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiUrl = env.VITE_API_URL || "http://localhost:3000";
  const appPort = Number(env.VITE_APP_PORT) || 5173;

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: appPort,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          cookieDomainRewrite: "",
          cookiePathRewrite: { "*": "/" },
        },
      },
    },
  };
});
