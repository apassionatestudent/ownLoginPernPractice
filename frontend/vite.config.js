import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // import Tailwind CSS 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // use Tailwind CSS
  server: {
    // so you don't have to put http://localhost:5000/ => /api/auth 
    // I think the CLIENT_URL = localhost also works 
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
});