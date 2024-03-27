import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RefContextProvider } from "../../../lib/hooks/repo";
import { StorageConfigProvider } from "../../../lib/hooks/storageConfig";

const RepositoryObjectsPage = lazy(() => import("./repo-comp/objects/objects"));
const RepositoryChangesPage = lazy(() => import("./repo-comp/changes/changes"));
const RepositoryBranchesPage = lazy(() => import("./repo-comp/branches/branches"));
const RepositoryCommitsIndexPage = lazy(() => import("./commits"));
const RepositoryGeneralSettingsPage = lazy(() => import("./settings/general"));
const RepositoryObjectsViewPage = lazy(() => import("./repo-comp/objects/objectViewer"));
const AKSKPage = lazy(() => import("./settings/AKSK"));


const RepositoryPage = () => {
  return (
      <RefContextProvider>
        <StorageConfigProvider>
          <Routes>
            <Route path="objects/*" element={<RepositoryObjectsPage />} />
            <Route path="object/*" element={<RepositoryObjectsViewPage />} />
            <Route path="changes/*" element={<RepositoryChangesPage />} />
            <Route path="commits/*" element={<RepositoryCommitsIndexPage />} />
            <Route path="branches/*" element={<RepositoryBranchesPage />} />
            <Route path="settings/*" element={<RepositoryGeneralSettingsPage />} />
            <Route path="settings/general/*" element={<RepositoryGeneralSettingsPage />} />
            <Route path="settings/AKSK/*" element={<AKSKPage />} />
            <Route path="/" element={<Navigate to=":user/" />} />
          </Routes>
        </StorageConfigProvider>
      </RefContextProvider>
  );
};

export default RepositoryPage;
