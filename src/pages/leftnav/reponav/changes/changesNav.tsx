import {   Form, Row } from "react-bootstrap"
import React from "react";
import { Tree } from "../../comp/tree";
import { repos } from "../../../../lib/api/interface";
import { Objectlist } from "./changeslist";


const Changesnav = () =>{
    
    return(
        <Row className="sidebar">
        <Form className='flex Fast-navb'>
        <Tree api={repos.getEntriesInRef} List={Objectlist} tittle={"Changes List"}></Tree>  
        </Form>
        </Row>
    );
  }

  
export default Changesnav