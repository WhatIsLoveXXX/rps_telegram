import { useLaunchParams, miniApp, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { Navigate, Route, Routes, HashRouter } from "react-router-dom";

import { routes } from "@/navigation/routes.tsx";
import { MainLayout } from "@/layouts/MainLayout";
import { useEffect } from "react";
import { authorize } from "../../services/users.api";
import { useInitDataRow } from "@/hooks/useInitDataRow";

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const initDataRaw = useInitDataRow();

  useEffect(() => {
    authorize(initDataRaw);
  }, [initDataRaw]);

  return (
    <>
      <AppRoot
        appearance={isDark ? "dark" : "light"}
        platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
      >
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {routes.map((route) => (
                <Route key={route.path} {...route} />
              ))}
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AppRoot>
    </>
  );
}
