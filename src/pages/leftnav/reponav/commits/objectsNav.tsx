import {   Form, Row } from "react-bootstrap"
import React from "react";
import { repos } from "../../../../lib/api/interface";
import { Commitslist } from "./objectlist";
import { Tree } from "../../comp/tree";


const Commitsnav = () =>{
    
   
    return(
        <Row className="sidebar">
        <Form className='flex Fast-navb'>
        <Tree api={repos.getCommitsInRef} List={Commitslist} tittle={'Commits List'}></Tree>  
        </Form>
        </Row>
    );
  }

  
export default Commitsnav