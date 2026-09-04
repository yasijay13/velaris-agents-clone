import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import AgentsPage from "./pages/AgentsPage";
import AgentBuilderPage from "./pages/AgentBuilderPage";
import AgentProfilePage from "./pages/AgentProfilePage";
import ComingSoon from "./pages/ComingSoon";
import { AgentsProvider } from "./state/agentsStore";
import { WorkItemOverridesProvider } from "./state/workItemOverridesStore";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AgentsProvider>
     <WorkItemOverridesProvider>
      <HashRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Navigate to="/agents" replace />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/build/:expertSlug" element={<AgentBuilderPage />} />
            <Route path="/agents/:agentId" element={<AgentProfilePage />} />
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Routes>
      </HashRouter>
     </WorkItemOverridesProvider>
    </AgentsProvider>
  </React.StrictMode>,
);
