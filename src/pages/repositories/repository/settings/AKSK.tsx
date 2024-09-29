import React, { useContext, useEffect, useState } from "react"
import { RepositoryPageLayout } from "../../../../lib/components/repository/layout"
import { SettingsLayout } from "./layout"
import { Button, Card,  Col,  Container, Form, Modal, Row } from "react-bootstrap"
import Loading from "../../../../lib/components/loading"
import { AlertError } from "../../../../lib/components/controls"
import { Link } from "react-router-dom"
import dayjs from "dayjs"
import { cache } from "../../../../lib/api"
import { useAPI } from "../../../../lib/hooks/api"
import { users } from "../../../../lib/api/interface"
import { Aksk } from "../../../../lib/api/interface/Api"
import { ActivepageContext } from "../../../../lib/hooks/conf"

const CreateAKSKModal = ({show, onSubmit, onCancel,setDescription}) => {    
    const handleInput = (e)=>{
        setDescription(e.target.value)
    }
    return (
        <Modal show={show} onHide={() => {
            onCancel();
        }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create AKSK</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            description:
                <Form.Control className="mt-2" placeholder="Input description" type="text" autoFocus onChange={handleInput}/>
                <Form.Control value="Create" type="submit" className="creatButton" onClick={onSubmit}/>
            </Modal.Body>
             
        </Modal>
    );
};
const AlertModal = ({show, onSubmit, onCancel,AK}) => {    

    return (
        <Modal show={show} onHide={() => {
            onCancel();
        }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Delete Access key</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <strong>Are you sure you want to delete the Access key?{"("+AK+")"}</strong>
                <Form.Control value="Delete"  type="submit"  onClick={onSubmit}/>
            </Modal.Body>
             
        </Modal>
    );
};

const AKSK =()=>{
    
    const [showCreateAKSKModal,setShowCreateAKSKModal] = useState(false)
    const [description,setDescription] = useState('')
    const [showAlertModal,setShowAlertModal] = useState(false)
    const [refesh,setRefesh] = useState(false)
    let {
        response,
        loading,
        error
      } = useAPI(async ()=>await  users.listAksks(),[refesh]);
      
    if (loading) return <Loading/>;
    if (error) return <AlertError error={error}/>;
    return(
        <div className="mt-2 mb-5">

        <div className="section-title">
            <h4>AKSK</h4>
        </div>

        <Container className="AKSK-List">
            <Row>
            <Button onClick={()=>{setShowCreateAKSKModal(true)}}>Create Access key</Button>
            </Row>
            {response.data.results.map((AKSK:Aksk)=>{   
                                return(  
                                    <Card key={AKSK.id}>
                                        <Card.Body>
                                        <Col>
                                        Access key:
                                            <h5>
                                                <Link to={""}>
                                                {AKSK.access_key} 
                                                </Link>
                                            </h5>
                                        Secret key:
                                        <h5>
                                                <Link to={""}>
                                                {AKSK.secret_key} 
                                                </Link>
                                            </h5>
                                            <p>
                                                <small>
                                                    created at <code>{dayjs.unix(Math.floor(AKSK.created_at)/1000).toISOString()}</code> ({dayjs.unix( Math.floor(AKSK.created_at)/1000).fromNow()})<br/>
                                                    {AKSK.description}
                                                </small>
                                            </p>
                                        </Col>
                                       
                                            <Button variant="danger" onClick={()=>setShowAlertModal(true)}>Delete</Button>

                                        </Card.Body>
                                     <AlertModal 
                                    AK={AKSK.access_key}
                                    onCancel={() => { setShowAlertModal(false) }}
                                    onSubmit={() => {
                                        users.deleteAksk({id:AKSK.id,access_key:AKSK.access_key})
                                        setRefesh(!refesh)
                                        setShowAlertModal(false)
                                    }}
                                    show={showAlertModal}
                                    />
                                    </Card>
                                    
                                )
                            })
                        }
        </Container>  
        <CreateAKSKModal
                onCancel={() => { setShowCreateAKSKModal(false) }}
                onSubmit={() => {
                    users.createAksk(description && description)
                    setRefesh(!refesh)
                    setShowCreateAKSKModal(false)
                }}
                setDescription={setDescription}
                show={showCreateAKSKModal}/>
       
    </div>
    )
}
const AKSKPage = ()=>{
    const activepage = useContext(ActivepageContext)

    useEffect(()=>{
        activepage.setPage('settings')
    },[])
    return (
        <RepositoryPageLayout activePage={'settings'}>
            <SettingsLayout activeTab={"AKSK"}>
                <AKSK />
            </SettingsLayout>
        </RepositoryPageLayout>
    )
}

export default AKSKPage