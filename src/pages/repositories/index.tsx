
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ButtonToolbar, Card, Container, Dropdown, Form, FormControl } from "react-bootstrap";
import { GoRepoPush } from "react-icons/go";
import { HiSortAscending  } from "react-icons/hi";
import { PiSortAscendingBold } from "react-icons/pi";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Layout from "../../lib/components/layout";
import { ActionsBar } from "../../lib/components/controls";
import { cache } from '../../lib/api';
import { useRouter } from "../../lib/hooks/router";
import { PiTextAaBold } from "react-icons/pi";
import Alert from '@mui/material/Alert';

import { Route, Routes } from "react-router-dom";
import { CreateRepositoryButton, CreateRepositoryModal, RepositoryList } from "./repos-comp";
import { users } from "../../lib/api/interface/index";
import { ActivepageContext } from "../../lib/hooks/conf";
import { activepage } from "../../lib/hooks/interface";
type Order = 'asc' | 'desc';
type SortBy = 'name' | 'created_at';
const RepositoryPage = React.lazy(() => import('./repository'));


dayjs.extend(relativeTime);

const RepositoriesPage = () => {
    const router = useRouter();
    const [showAlert, setShowAlert] = useState(false);
    const [alertClass, setAlertClass] = useState('');
    const [visible, setVisible] = useState(showAlert);
    const [alertMessage, setAlertMessage] = useState('');
    const [showCreateRepositoryModal, setShowCreateRepositoryModal] = useState(false);
    const [sampleRepoChecked, setSampleRepoChecked] = useState(false);
    const [createRepoError, setCreateRepoError] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [creatingRepo, setCreatingRepo] = useState(false);
    const [repoamount, setRepoAmount] = useState(0);
    const [search,setSearch] = useState('')
    const [filter, setFilter] = useState('')
    const [sortBy, setSortBy] = useState<SortBy>('name');
    const [order, setOrder] = useState<Order>('asc');
    function debounce(func: Function, delay: number) {
        let timer: NodeJS.Timeout;
        return  (...args: any[]) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            func.apply(this, args);
          }, delay);
        };
      }
    const handleChange:React.ChangeEventHandler<HTMLInputElement> = (e)=>{
        setSearch(e.target.value);
    }
    const debouncedHandleChange = debounce(handleChange, 300);

    useEffect(() => {
        if (!cache.get('token')) { router.push('/login') }
    })
    const activepageL: activepage = useContext(ActivepageContext)
    useEffect(() => {
        activepageL.setPage('repositories')
    })
    const createRepo = async (repo: { name: string, description: string ,visible:boolean,blockstore_config:string}, presentRepo = true) => {
        const owner = cache.get('user')
        try {
            setCreatingRepo(true);
            setCreateRepoError(null);
            const usersData = await users.createRepository(repo);
            setRefresh(!refresh);
            if (presentRepo) {
                router.push({ pathname: `/repositories/:user/:repoId/objects`, params: { repoId: repo.name, user: owner }, query: {} });
            }
            return true;
        } catch (error: any) {
            setCreatingRepo(false);
            setShowAlert(true)
            setCreateRepoError(error);
            setAlertMessage(error)
            return false;
        }
    };
    useEffect(()=>{
        let fil = router.query.fil
        setFilter(fil?fil:'')
    },[router])

    const createRepositoryButtonCallback = useCallback(() => {
        setSampleRepoChecked(false);
        setShowCreateRepositoryModal(true);
        setCreateRepoError(null);
    }, [showCreateRepositoryModal, setShowCreateRepositoryModal]);
    useEffect(() => {
        if (showAlert) {
          setAlertClass(''); // Clear the fade-out animation class to show the alert
          // Set a timer to add the fade-out animation class after a delay
          const timer = setTimeout(() => {
            setAlertClass('fade-out'); // Add the fade-out animation class
            // Set another timer to hide the alert after the fade-out animation completes
            setTimeout(() => setShowAlert(false), 500); // Delay hiding the alert to allow the animation to finish
          }, 2000); // Show the alert for 2000ms (2 seconds)
          // Cleanup function to clear the timer if the component unmounts or `showAlert` changes
          return () => clearTimeout(timer);
        }
      }, [showAlert]); // Dependency array: effect will run whenever `showAlert` changes
    
    return (
        <Layout>
            {/* Pop up window does not prompt bug fix */}
             {showAlert && <Alert severity="error" className={`Alerterror ${alertClass}`}>Request error: {alertMessage.status}</Alert>}
            <Container fluid="xl" className="mt-3">
                {<ActionsBar>
                    <h2 className="repoTittle"><strong>{filter?filter:'All'}</strong></h2>
                    <ButtonToolbar className="ms-auto mb-2">
                        <CreateRepositoryButton variant="primary" enabled={true} onClick={createRepositoryButtonCallback} />
                    </ButtonToolbar>
                </ActionsBar>}
                <Form>
                    <FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={debouncedHandleChange}/>
                </Form>

                <Card className="repo-card">
                    <Card.Header className="repo-card-header">
                        <strong>{repoamount} repositories</strong>
                        <Dropdown>
        <Dropdown.Toggle variant="outline-primary" className="sortType"  id="dropdown-basic">
          {order=='asc'?<HiSortAscending />:<PiSortAscendingBold />}
          {sortBy=='name'?'Name':'Last Pushed'}-{order=='asc'?'Ascending':'Descending'}
          {/*fixui2.0 Modifying bugs, filtering data prompts are not complete enough */}
        </Dropdown.Toggle>
        <Dropdown.Menu className="sortMenu">
          <Dropdown.Item onClick={() => setSortBy('name')}><PiTextAaBold />Name</Dropdown.Item>
          <Dropdown.Item onClick={() => setSortBy('created_at')} className="UpsplitDropdown"><GoRepoPush />Last Pushed</Dropdown.Item>
          <Dropdown.Item onClick={() => setOrder('asc')} className="DownsplitDropdown"><HiSortAscending />Ascending</Dropdown.Item>
          <Dropdown.Item onClick={() => setOrder('desc')}><PiSortAscendingBold />Descending</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

                    </Card.Header>
                <RepositoryList
                    refresh={refresh}
                    setRepoAmount={setRepoAmount}
                    search={search}
                    filter={filter}
                    sortBy={sortBy}
                    order={order}
                />
                </Card>


                <CreateRepositoryModal
                    onCancel={() => {
                        setShowCreateRepositoryModal(false);
                        setCreateRepoError(null);
                    }}
                    show={showCreateRepositoryModal}
                    setShow={setShowCreateRepositoryModal}
                    error={createRepoError}
                    setRefresh={setRefresh}
                    onSubmit={(repo) => createRepo(repo, true)}
                    samlpleRepoChecked={sampleRepoChecked}
                    inProgress={creatingRepo}
                    refresh={refresh}
                />

            </Container>
        </Layout>

    );
}

const RepositoriesIndex = () => {

    return (
        <Routes>
            <Route path="/" element={<RepositoriesPage />} />
            <Route path=":user/:repoId/*" element={<RepositoryPage />} />
        </Routes>
    );
};

export default RepositoriesIndex;

