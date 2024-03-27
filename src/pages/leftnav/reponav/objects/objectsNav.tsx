import {   Form, Row } from "react-bootstrap"
import React from "react";
import { Tree } from "../../comp/tree";
import { repos } from "../../../../lib/api/interface";
import { Objectlist } from "./objectlist";


const RepositoryObjectsNav = () =>{
    
    return(
        <Row className="sidebar">
        <Form className='flex Fast-navb'>
        <Tree api={repos.getEntriesInRef} List={Objectlist} tittle={'Object List'}></Tree>  
        </Form>
        </Row>
    );
  }

  
export default RepositoryObjectsNav