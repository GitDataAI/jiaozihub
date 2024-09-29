import React, {useContext, useEffect, useRef, useState} from "react";

import {GitCommitIcon, HistoryIcon,} from "@primer/octicons-react";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

import {cache} from "../../../../../lib/api";
import {useAPI} from "../../../../../lib/hooks/api";
import {useRefs} from "../../../../../lib/hooks/repo";
import {ConfirmationModal} from "../../../../../lib/components/modals";
import {ActionGroup, ActionsBar, AlertError, Loading, RefreshButton} from "../../../../../lib/components/controls";
import RefDropdown from "../../../../../lib/components/repository/refDropdown";
import {RepositoryPageLayout} from "../../../../../lib/components/repository/layout";
import {formatAlertText} from "../../../../../lib/components/repository/errors";
import {useRouter} from "../../../../../lib/hooks/router";
import {Tree} from "../../../../../lib/components/repository/changestree";
import {RepoError} from "../error/error";
import { ChangesBrowserProps, CommitButtonProps, ResultsState, RevertButtonProps, SetState } from "../../../interface/repo_interface";
import { object, repos, wip } from "../../../../../lib/api/interface/index";
import { UploadButton } from "../objects/uplodaButton";
import ChangeList from "../../commits/commit/changesrow";
import { ActivepageContext } from "../../../../../lib/hooks/conf";

const CommitButton: React.FC<CommitButtonProps> = ({repo, onCommit, enabled = false}) => {
    const [msg, setMsg] = useState('');
    const handleDescriptionChange:React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setMsg(e.target.value);
      };
      
    const textRef = useRef<HTMLInputElement>(null);

    const [committing, setCommitting] = useState(false)
    const [show, setShow] = useState(false)
    const hide = () => {
        setShow(false)
    }

    const onSubmit = () => {
        const message = textRef.current ?  textRef.current.value : '';
        const metadata: { [key: string]: string } = {};
        setCommitting(true)
        onCommit({message, metadata}, () => {
            setCommitting(false)
            setShow(false);
        })
    };

    const alertText = formatAlertText(repo.id, null);
    useEffect(() => {
        if (msg) {
            setCommitting(false);
        } else  {
            setCommitting(true);
        }
      }, [msg]);
    return (
        <>
            <Modal show={show} onHide={hide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Commit Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="mb-2" onSubmit={(e) => {
                        onSubmit();
                        e.preventDefault();
                    }}>
                        <Form.Group controlId="message" className="mb-3">
                            <Form.Control type="text" placeholder="Commit Message" ref={textRef} onChange={handleDescriptionChange}/>
                        </Form.Group>

                    </Form>
                    {(alertText) ? (<Alert variant="danger">{alertText}</Alert>) : (<span/>)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Cancel
                    </Button>
                    <Button variant="primary" disabled={committing} onClick={onSubmit}>
                        Commit Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            <Button variant="primary" disabled={!enabled} onClick={() => setShow(true)}>
                <GitCommitIcon/> Commit Changes{' '}
            </Button>
        </>
    );
}


const RevertButton:React.FC<RevertButtonProps> = ({onRevert, enabled = false}) => {
    const [show, setShow] = useState(false)
    const hide = () => setShow(false)

    return (
        <>
            <ConfirmationModal
                show={show}
                onHide={hide}
                msg="Are you sure you want to revert all uncommitted changes?"
                onConfirm={() => {
                    onRevert();
                    hide();
                } } variant={""}/>
            <Button variant="light" disabled={!enabled} onClick={() => setShow(true)}>
                <HistoryIcon/> Revert
            </Button>
        </>
    );
}

export async function appendMoreResults(
    resultsState: ResultsState,
    prefix: string,
    afterUpdated: string,
    setAfterUpdated: SetState<string>,
    setResultsState: SetState<ResultsState>,
    getMore
  ): Promise<ResultsState>{
    let resultsFiltered = resultsState.results
    if (resultsState.prefix !== prefix) {
        setAfterUpdated("")
        resultsFiltered = []
    }
    if (resultsFiltered.length > 0 && resultsFiltered.at(-1) && resultsFiltered.at(-1).path > afterUpdated) {
        return {prefix: prefix, results: resultsFiltered, pagination: resultsState.pagination}
      }
    const response = await getMore()
    
    let pagination = {}
    const results = response.data
    setResultsState({prefix: prefix, results: resultsFiltered.concat(results), pagination: pagination})
return {prefix: resultsState.prefix, results: resultsState.results, pagination: pagination}
}

const ChangesBrowser: React.FC<ChangesBrowserProps> = ({repo, reference, prefix, onSelectRef, }) => {
    const [actionError, setActionError] = useState<Error | null>(null);
    const [internalRefresh, setInternalRefresh] = useState(true);
    const [afterUpdated, setAfterUpdated] = useState(""); // state of pagination of the item's children
    const [resultsState, setResultsState] = useState<ResultsState>({prefix: prefix, results:[], pagination:{}}); // current retrieved children of the item
    const user = cache.get('user')
    const delimiter = '/'
    const router = useRouter();
    const { path, after } = router.query;
    const [showUpload, setShowUpload] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const {setPage,setRefresh,refresh:refre} = useContext(ActivepageContext)

    useEffect(()=>{
        setPage('changes')
    },[])
    const initialState = {
        inProgress: false,
        error: null,
        done: false,
      };
      const [deleteState, setDeleteState] = useState(initialState);
    const {loading:loaded} = useAPI(()=>wip.getWip(repo.name,user,{refName:reference.name}))   

    const { response,loading:load} = useAPI(async() =>
    {return await repos.getEntriesInRef(user,repo.name,{ref:reference.name,type:'wip',path:path?path:'/'})}
    ,[repo.name,internalRefresh,path])

    const { error , loading } = useAPI(async () => {
        if (!repo) return
        return await appendMoreResults(resultsState, prefix, afterUpdated, setAfterUpdated, setResultsState,
           () => wip.getWipChanges(user,repo.name,{refName:reference.name}) );
    }, [repo.name, reference.name, internalRefresh, afterUpdated, delimiter, prefix])
    const results = resultsState.results
    useEffect(()=>{
        if(loading || load || loaded)
            setTimeout(()=>refresh(), 100);
    },[])
    const update=()=>{
        wip.updateWip(user,repo.name,{refName:reference.name},{})
        setInternalRefresh(!internalRefresh)
    }
    const refresh = () => {
        setResultsState({prefix: prefix, results:[], pagination:{}})
        setInternalRefresh(!internalRefresh)
        setRefresh(!refre)
    }
    
    if (error) return <AlertError error={error}/>
    if (loading || load ||loaded) return <Loading/>

    let onReset = async (entry) => {
        wip.revertWipChanges(repo.name, user,{refName:reference.name,pathPrefix:entry.path})
            .then(refresh)
            .catch(error => {
                setActionError(error)
            })
    }

    const changesTreeMessage = <p>Showing changes for branch <strong>{reference.name}</strong></p>

   const actionErrorDisplay = (actionError) ?
        <AlertError error={actionError} onDismiss={() => setActionError(null)}/> : <></>

    return (
        <>
            <ActionsBar>
                <ActionGroup orientation="left">
                    <RefDropdown
                        emptyText={'Select Branch'}
                        repo={repo}
                        selected={(reference) ? reference : null}
                        withCommits={false}
                        withWorkspace={false}
                        withTags={false}
                        selectRef={onSelectRef}
                        onCancel={undefined} 
                        />
                </ActionGroup>
                
                <ActionGroup orientation="right">

                    <RefreshButton enabled={results.length > 0} onClick={update}/>

                    <RevertButton enabled={results.length > 0} onRevert={() => {
                        wip.revertWipChanges(repo.name, user,{refName:reference.name})
                            .then(refresh)
                            .catch(error => setActionError(error))
                    }}/>
                    <UploadButton
                        reference={reference}
                        path={path ? path : "/"}
                        repoId={repo.name}
                        onDone={refresh}
                        onClick={() => {
                        setShowUpload(true);
                        } }
                        onHide={() => {
                        setShowUpload(false);
                        } }
                        show={showUpload} 
                        wipID={undefined}          
                        />
                    <CommitButton repo={repo} enabled={results.length > 0} onCommit={async (commitDetails, done) => {
                        try {
                            const user = cache.get('user')
                            await wip.commitWip(user, repo.name, {refName:reference.name ,msg:commitDetails.message}, commitDetails.metadata);
                            setActionError(null);
                            refresh();
                        } catch (err) {
                            if(err instanceof Error) {
                            setActionError(err);}
                        }
                        done();
                    }}/>
                </ActionGroup>
            </ActionsBar>
           
            {actionErrorDisplay}
            {deleteState.error && <AlertError error={deleteState.error} onDismiss={() => setDeleteState(initialState)}/>}
            <Tree
                repo={repo}
                changes={results}
                reference={reference}
                path={(path) ? path : ""}
                showActions={true}
                results={response.data?response.data:[null]}
                after={after}
                onPaginate={(after:string) => {
                    const query = { after,path:"",ref:""};
                    if (path) query.path = path;
                    if (reference) query.ref = reference.name;
                    const url = {
                      pathname: `/repositories/:user/:repoId/objects`,
                      query,
                      params: { repoId: repo.name,user },
                    };
                    router.push(url);
                  }}
                onUpload={() => {
                    setShowUpload(true);
                  }}
                onImport={() => {
                    setShowImport(true)}
                }
                onDelete={(entry,dirname) => {
                    object
                        .deleteObject(user, repo.name, {refName:reference.name,path:dirname?dirname+'/'+entry.name:entry.name})
                        .catch(error => {
                            setDeleteState({...initialState, error: error})
                            throw error
                        })
                        .then(refresh)
                }}
            />
            {changesTreeMessage}
            <ChangeList 
            changes={results}
            revert={onReset}
             />
        </>
    )
}

const ChangesContainer = () => {
    const router = useRouter();
    const {repo, reference, loading, error} = useRefs()    
    const {prefix} = router.query
    const user = cache.get('user')

    
    if (loading) return <Loading/>
    if (error) return <RepoError error={error}/>

    return (
        <ChangesBrowser
            prefix={(prefix) ? prefix : ""}
            repo={repo}
            reference={reference}
            onSelectRef={ref => 
               {
                router.push({
                pathname: `/repositories/:user/:repoId/changes`,
                params: {repoId: repo.name,user},
                query: {
                    ref: ref.id,
                }
            })}}
        />
    )
}

const RepositoryChangesPage = () => {
    return (
            <RepositoryPageLayout activePage={'changes'}>
                <ChangesContainer/>
            </RepositoryPageLayout>
    )
}

export default RepositoryChangesPage;
