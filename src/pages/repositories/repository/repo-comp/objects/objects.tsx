import React, {useContext, useEffect,useState } from "react";
import { RepositoryPageLayout } from "../../../../../lib/components/repository/layout";
import RefDropdown from "../../../../../lib/components/repository/refDropdown";
import {
    ActionGroup,
    ActionsBar,
    Loading,
    RefreshButton,
} from "../../../../../lib/components/controls";
import {useRefs} from "../../../../../lib/hooks/repo";
import {useRouter} from "../../../../../lib/hooks/router";
import { Box } from "@mui/material";
import { RepoError } from "../error/error";
import { NoGCRulesWarning, ReadmeContainer, TreeContainer } from "./obj_comps";
import { Button } from "react-bootstrap";
import { UploadIcon } from "@primer/octicons-react";
import { Link } from "../../../../../lib/components/nav";
import { cache } from "../../../../../lib/api";
import { ActivepageContext } from "../../../../../lib/hooks/conf";


const ObjectsBrowser = () => {
  const router = useRouter();
  const { path, after, importDialog,commitId} = router.query ;
  const { repo, reference, loading, error } = useRefs();  
  
  const [showUpload, setShowUpload] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filepath,setFilepath] = useState(path);
  const [refreshToken, setRefreshToken] = useState(false);
  const refresh = () => setRefreshToken(!refreshToken);
  const parts = (path && path.split("/")) || [];
  let searchPrefix = parts.join("/");
  const user = cache.get('user')
  searchPrefix = searchPrefix && searchPrefix + "/";
  useEffect(() => {
    setFilepath(path)
    refresh()
  }, [path]); 

  if (loading) return <Loading />;
  if (error) return <RepoError error={error} />;
  if (commitId){
  
  return(
  <>
   <ActionsBar>
        <ActionGroup orientation="left">
          <RefDropdown
            emptyText={"Select Branch"}
            repo={repo}
            commitId={commitId}
            selected={reference}
            withCommits={true}
            withWorkspace={true}
            selectRef={(ref) => router.push({
              pathname: `/repositories/:user/:repoId/objects`,
              params: {
                repoId: repo.name,
                user,
                path: path === undefined ? "" : path,
              },
              query: { ref:ref.id, path: path === undefined ? "" : path },
            })} onCancel={undefined}          
            />
        </ActionGroup>

        <ActionGroup orientation="right">
        <Button
        variant={"light"}
        >
           <Link href={{
            pathname: `/repositories/:user/:repoId/changes`,
            params: {repoId: repo.name,user},
            }}>
        <UploadIcon />Edit
          </Link>
        </Button>
          
        </ActionGroup>
      </ActionsBar>

      <NoGCRulesWarning repoId={repo.name} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          mb: "30px",
        }}
      ></Box>

      <TreeContainer
            commitId={commitId}
            reference={reference}
            repo={repo}
            path={filepath ? filepath : "/"}
            after={after ? after : ""}
            onPaginate={(after:string) => {
            const query = { after,path:"",ref:""};
            if (path) query.path = path;
            if (reference) query.ref = reference.id;
            const url = {
              pathname: `/repositories/:user/:repoId/objects`,
              query,
              params: { repoId: repo.name,user },
            };
            router.push(url);
          }}
          refreshToken={refreshToken}
          onUpload={() => {
            setShowUpload(true);
          }}
          onImport={() => {
            setShowImport(true);
          }}
          onRefresh={refresh}
        />
  </>)}
  else
  return (
    <>
      <ActionsBar>
        <ActionGroup orientation="left">
          <RefDropdown
            emptyText={"Select Branch"}
            repo={repo}
            selected={reference}
            withCommits={true}
            withWorkspace={true}
            selectRef={(ref) => router.push({
              pathname: `/repositories/:user/:repoId/objects`,
              params: {
                repoId: repo.name,
                user
              },
              query: { ref:ref.id},
            })} onCancel={undefined}          
            />
        </ActionGroup>

        <ActionGroup orientation="right">
         
          <RefreshButton onClick={refresh} enabled={false} />
        <Button
        variant={"light"}
        >
           <Link href={{
            pathname: `/repositories/:user/:repoId/changes`,
            params: {repoId: repo.name,user},
            }}>
        <UploadIcon />Edit
          </Link>
        </Button>
          
        </ActionGroup>
      </ActionsBar>

      <NoGCRulesWarning repoId={repo.name} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          mb: "30px",
        }}
      >
        <TreeContainer
            reference={reference}
            repo={repo}
            path={filepath ? filepath : "/"}
            after={after ? after : ""}
            onPaginate={(after:string) => {
            const query = { after,path:"",ref:""};
            if (path) query.path = path;
            if (reference) query.ref = reference.id;
            const url = {
              pathname: `/repositories/:user/:repoId/objects`,
              query,
              params: { repoId: repo.name,user },
            };
            router.push(url);
          }}
          refreshToken={refreshToken}
          onUpload={() => {
            setShowUpload(true);
          }}
          onImport={() => {
            setShowImport(true);
          }}
          onRefresh={refresh}
        />

        <ReadmeContainer
          reference={reference}
          repo={repo}
          path={path}
          refreshDep={refreshToken}
        />
      </Box>
    </>
  );
};

const RepositoryObjectsPage = () => {
  const activepage = useContext(ActivepageContext)

    useEffect(()=>{
        activepage.setPage('objects')
    },[])
  return (
    <RepositoryPageLayout activePage={"objects"}>
      <ObjectsBrowser />
    </RepositoryPageLayout>
  );
};

export default RepositoryObjectsPage;
