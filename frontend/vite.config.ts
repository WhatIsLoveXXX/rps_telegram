import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    svgr(),
    tailwindcss(),
    // Creates a custom SSL certificate valid for the local machine.
    // Using this plugin requires admin rights on the first dev-mode launch.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    // process.env.HTTPS && mkcert(),
    mkcert(),
  ],
  publicDir: "./public",
  // server: {
  //   // Exposes your dev server and makes it accessible for the devices in the same network.
  //   host: true,
  // },
  server: {
    host: "rds-mini-app.local",
    port: 443,
  },
});
