import React, {useContext, useEffect, useMemo, useRef, useState} from "react";

import {
    GitBranchIcon,
    LinkIcon,
    PackageIcon,
    TrashIcon
} from "@primer/octicons-react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

import {cache} from "../../../../../lib/api";

import {
    ActionGroup,
    ActionsBar, ClipboardButton,
    AlertError, LinkButton,
    Loading
} from "../../../../../lib/components/controls";
import {RepositoryPageLayout} from "../../../../../lib/components/repository/layout";
import {useRefs} from "../../../../../lib/hooks/repo";
import {useAPIWithPagination} from "../../../../../lib/hooks/api";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import RefDropdown from "../../../../../lib/components/repository/refDropdown";
import Badge from "react-bootstrap/Badge";
import {ConfirmationButton} from "../../../../../lib/components/modals";
import Alert from "react-bootstrap/Alert";
import {Link} from "../../../../../lib/components/nav";
import {useRouter} from "../../../../../lib/hooks/router";
import {RepoError} from "../error/error";
import { BranchListProps, BranchWidgetParms, CreateBranchButtonProps } from "../../../interface/repo_interface";
import { Branch } from "../../../../../lib/api/interface/Api";
import { repos } from "../../../../../lib/api/interface/index";
import { ActivepageContext } from "../../../../../lib/hooks/conf";

const ImportBranchName = 'import-from-inventory';


const BranchWidget = ({ repo, branch, onDelete }:BranchWidgetParms) => {

    const buttonVariant = "outline-dark";
    const isDefault = repo.head === branch.name;
    const user = cache.get("user")
    let deleteMsg = (
        <>
            Are you sure you wish to delete branch <strong>{branch.name}</strong> ?
        </>
    );
    if (branch.name === ImportBranchName) {
        deleteMsg = (
            <>
                <p>{deleteMsg}</p>
                <Alert variant="warning"><strong>Warning</strong> this is a system branch used for importing data to JZFS</Alert>
            </>
        );
    }

    return (
        <ListGroup.Item>
            <div className="clearfix">
                <div className="float-start">
                    <h6>
                        <Link 
                        href={{
                            pathname: '/repositories/:user/:repoId/objects',
                            params: {repoId: repo.name,user},
                            query: {ref: branch.name}
                        }}
                        >
                            {branch.name}
                        </Link>

                        {isDefault &&
                        <>
                            {' '}
                            <Badge>Default</Badge>
                        </>}
                    </h6>
                </div>


                <div className="float-end">
                    {!isDefault &&
                    <ButtonGroup className="commit-actions">
                        <ConfirmationButton
                                variant="outline-danger"
                                disabled={isDefault}
                                msg={deleteMsg}
                                tooltip="delete branch"
                                onConfirm={() => {
                                    repos.deleteBranch(user, repo.name,{refName:branch.name})
                                        .catch(err => alert(err))
                                        .then(() => onDelete(branch.name));
                                } } 
                                modalVariant={""} 
                                size={"sm"}                        >
                            <TrashIcon/>
                        </ConfirmationButton>
                    </ButtonGroup>
                    }

                    <ButtonGroup className="branch-actions ms-2">
                        <LinkButton                           
                        href={{
                            pathname: '/repositories/:user/:repoId/objects',
                            params: {repoId: repo.name,user},
                            query: {ref: branch.name
                            }}}
                            buttonVariant="outline-dark"
                            // tooltip="View referenced commit"
                            >
                            {branch.name.substr(0, 12)}
                        </LinkButton>
                        <ClipboardButton variant={buttonVariant} text={branch.name} tooltip="Copy ID to clipboard" onSuccess={undefined} onError={undefined}/>
                        <ClipboardButton variant={buttonVariant} text={`jzfs://${repo.name}/${branch.name}`} tooltip="Copy URI to clipboard" icon={<LinkIcon />} onSuccess={undefined} onError={undefined}/>
                        <ClipboardButton variant={buttonVariant} text={`s3://${repo.name}/${branch.name}`} tooltip="Copy S3 URI to clipboard" icon={<PackageIcon />} onSuccess={undefined} onError={undefined}/>
                    </ButtonGroup>
                </div>
            </div>
        </ListGroup.Item>
    );
};


const CreateBranchButton: React.FC<CreateBranchButtonProps> = ({ repo, variant = "success", onCreate = null, children }) => {
    const [show, setShow] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState<Error | boolean | null>(null);
    const textRef = useRef<HTMLInputElement>(null);
    const defaultBranch = useMemo(
        () => ({ name: repo.head, type: "branch"}),
        [repo.head]);
    const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
    const user = cache.get('user');
    

    const hide = () => {
        if (disabled) return;
        setShow(false);
    };

    const display = () => {
        setShow(true);
    };

    const onSubmit = async () => {
        setDisabled(true);
        const branchId = textRef.current ? textRef.current.value : '';
        
        const sourceRef = selectedBranch.name;

        try {
            await repos.createBranch(user, repo.name, {name:branchId,source:sourceRef});
            setError(false);
            setDisabled(false);
            setShow(false);
            if(onCreate) {
            onCreate();}
        } catch (err) {
            setError(err as Error);
            setDisabled(false);
        } 
    };

    return (
        <>
            <Modal show={show} onHide={hide} enforceFocus={false}>
                <Modal.Header  closeButton>
                    Create Branch
                </Modal.Header>
                <Modal.Body>

                    <Form onSubmit={(e) => {
                        onSubmit();
                        e.preventDefault();
                    }}>
                        <Form.Group controlId="name" className="mb-3">
                            <Form.Control type="text" placeholder="Branch Name" name="text" ref={textRef}/>
                        </Form.Group>
                        <Form.Group controlId="source" className="mb-3">
                            <RefDropdown
                                repo={repo}
                                emptyText={'Select Source Branch'}
                                prefix={'From '}
                                selected={selectedBranch}
                                selectRef={(ref) => {
                                    setSelectedBranch({ name:ref.id,type:ref.type });
                                } }
                                withCommits={true}
                                withWorkspace={false} onCancel={undefined}/>
                        </Form.Group>
                    </Form>

                    {error && <AlertError error={error as Error}/>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" disabled={disabled} onClick={hide}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={onSubmit} disabled={disabled}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            <Button variant={variant} onClick={display}>{children}</Button>
        </>
    );
};


const BranchList: React.FC<BranchListProps> = ({ repo, prefix, after}) => {
    const [refresh, setRefresh] = useState(true);
    const user = cache.get('user');
    const { results, error, loading } = useAPIWithPagination(async () => {
        return repos.listBranches(user, repo.name);
    }, [repo.id, refresh, prefix, after]);
    const {setPage,setRefresh:setRefre,refresh:refre} = useContext(ActivepageContext)

    useEffect(()=>{
        setPage('branches')
    },[])
    const doRefresh = () =>  {
        setRefresh(!refresh)
        setRefre(!refre)
    };

    let content;

    if (loading) content = <Loading/>;
    else if (error) content = <AlertError error={error}/>;
    else content = (
        <>
            <Card>
                <ListGroup variant="flush">
                    {results && results.map((branch:Branch) => 
                        <BranchWidget key={branch.id} repo={repo} branch={branch} onDelete={doRefresh}/>
                    )}
                </ListGroup>
            </Card>
            {/* <Paginator onPaginate={onPaginate} nextPage={nextPage} after={after}/> */}
        </>
    );

    return (
        <div className="mb-5">
            <ActionsBar>
                <ActionGroup orientation="right">
                    <CreateBranchButton repo={repo} variant="primary" onCreate={doRefresh}>
                        <GitBranchIcon/> Create Branch
                    </CreateBranchButton>

                </ActionGroup>
            </ActionsBar>
            {content}
        </div>
    );
};

const BranchesContainer:React.FC = () => {
    const router = useRouter()
    const { repo, loading, error } = useRefs();
    const { after } = router.query;
    const routerPfx = (router.query.prefix) ? router.query.prefix : "";
    const user = cache.get('user');

    if (loading) return <Loading/>;
    if (error) return <RepoError error={error}/>;

    return (
        <BranchList
            repo={repo}
            after={(after) ? after : ""}
            prefix={routerPfx}
            onPaginate={after => {
                const query = {after,prefix:''};
                if (router.query.prefix) query.prefix = router.query.prefix;
                router.push({pathname: '/repositories/:user/:repoId/branches', params: {repoId: repo.name,user}, query});
            }}/>
    );
};


const RepositoryBranchesPage = () => {

    return (
            <RepositoryPageLayout activePage={'branches'}>
                <BranchesContainer/>
            </RepositoryPageLayout>
    )
}

export default RepositoryBranchesPage;
