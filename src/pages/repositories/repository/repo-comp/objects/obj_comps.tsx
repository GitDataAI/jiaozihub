import React, { useCallback,useState } from "react";
import {
    AlertError,
    Loading,
} from "../../../../../lib/components/controls";
import {Alert} from "react-bootstrap";

import {Tree} from "../../../../../lib/components/repository/tree";
import {cache} from "../../../../../lib/api";
import {useAPI} from "../../../../../lib/hooks/api";
import {NoGCRulesWarningProps} from "../../../interface/repo_interface";
import { object, repos } from "../../../../../lib/api/interface/index";
import { getActions } from "../../../../../util/changes";
import { FileContents, getContentType, getFileExtension } from "./objectViewer";

const README_FILE_NAME = "README.md";


export const TreeContainer= ({
  repo,
  reference,
  path,
  after,
  onPaginate,
  onRefresh,
  onUpload,
  onImport,
  refreshToken,
  commitId
}) => {

  const user = cache.get('user')
  let changes = []
  let load = false
  if(commitId){
    const {response, loading} = useAPI(async () => {
      return await repos.getCommitChanges(user,repo.name,commitId);
  }, [repo.name, commitId]);
    changes = response
    load = loading    
  }
  const { response, error, loading } =commitId? useAPI(async() =>
  {return await repos.getEntriesInRef(user,repo.name,{ref:commitId,type:'commit',path})
}
  , [repo.name , refreshToken]):useAPI(async() =>
  {return await repos.getEntriesInRef(user,repo.name,{ref:reference.name,type:reference.type,path})
}
  , [repo.name , refreshToken])
  
  const initialState = {
    inProgress: false,
    error: null,
    done: false,
  };
  const [deleteState, setDeleteState] = useState(initialState);    
    if (loading || load) return <Loading/>;
    if(commitId){
      getActions(changes,response)
}

    if (error) return <AlertError error={error}/>;

    return (
        <>
            {deleteState.error && <AlertError error={deleteState.error} onDismiss={() => setDeleteState(initialState)}/>}
            <Tree
                repo={repo}
                reference={reference}
                path={(path) ? path : ""}
                showActions={true}
                results={response.data}
                after={after}
                onPaginate={onPaginate}
                onUpload={onUpload}
                onImport={onImport}
                onDelete={(entry,dirname) => {
                  object
                      .deleteObject(user, repo.name, {refName:reference.name,path:dirname?dirname+'/'+entry.name:entry.name})
                      .catch(error => {
                          setDeleteState({...initialState, error: error})
                          throw error
                      })
                      .then(refresh)
              }}
            /></>
    );
}

export const ReadmeContainer = ({
  repo,
  reference,
  path = "/",
  refreshDep,
}) => {
  let readmePath = "";

  if (path) {
    readmePath = path.endsWith("/")
      ? `${path}${README_FILE_NAME}`
      : `${path}${README_FILE_NAME}`;
  } else {
    readmePath = README_FILE_NAME;
  }
  const user = cache.get('user')
  
  const { response, error, loading } = useAPI(
    () => object.headObject(user,repo.name, {refName:reference.name,path:readmePath,type:reference.type}),
    [path, refreshDep]
  );

  if (loading || error) {
    return <></>; // no file found.
  }

  const fileExtension = getFileExtension(readmePath);
  const contentType = getContentType(response?.headers);
  

    return (
        <FileContents 
            repo={repo} 
            reference={reference}
            path={readmePath}
            fileExtension={fileExtension}
            contentType={contentType}
            type={reference.type}
            error={error}
            loading={loading}
            showFullNavigator={false}
            presign={true}
        />
    );
}

export const NoGCRulesWarning: React.FC<NoGCRulesWarningProps> = ({ repoId }) => {
  const user = cache.get('user')
  const storageKey = `show_gc_warning_${repoId}`;
  const [show, setShow] = useState(
    window.localStorage.getItem(storageKey) !== "false"
  );
  const closeAndRemember = useCallback(() => {
    window.localStorage.setItem(storageKey, "false");
    setShow(false);
  }, [repoId]);

  const { response } = useAPI(async () => {
    const repo = await repos.getRepository(user,repoId);
    
    if (
      !repo.data.storage_namespace.startsWith("s3:") &&
      !repo.data.storage_namespace.startsWith("http")
    ) {
      return false;
    }
  }, [repoId]);

  if (show && response) {
    return (
      <Alert variant="warning" onClose={closeAndRemember} dismissible>
        <strong>Warning</strong>: No garbage collection rules configured for
        this repository.{" "}
        <a
          href="https://docs.pando.network"
          target="_blank"
          rel="noreferrer"
        >
          Learn More
        </a>
        .
      </Alert>
    );
  }
  return <></>;
};

