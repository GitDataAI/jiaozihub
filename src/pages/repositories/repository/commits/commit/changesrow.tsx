import { FileIcon, HistoryIcon, PencilIcon, PlusIcon, TrashIcon } from "@primer/octicons-react"
import React, { useState } from "react"
import { Alert, Button, Card, OverlayTrigger, Table, Tooltip } from "react-bootstrap"

import { ConfirmationModal } from "../../../../../lib/components/modals";

const ChangeRow = ({change,revert}) =>{
    const subPath = change.path.lastIndexOf("/") !== -1 ? change.path.substr(0, change.path.lastIndexOf("/")) : "";
    
    const buttonText =
      subPath.length > 0 ? change.path.substr(subPath.length + 1) : change.path;
    const [show,setShow] = useState(false)
    const onHide = () =>{
      setShow(!show)
    }
    let  button = buttonText
    
    let diffIndicator;
    let diffstyle
    switch (change.action) {
    case 2:
        diffstyle = "diif-remove"
        diffIndicator = (
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>removed in diff</Tooltip>}
        >
          <span>
            <TrashIcon />
          </span>
        </OverlayTrigger>
      );
      break;
    case 1:
        diffstyle = "diif-add"
        diffIndicator = (
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>added in diff</Tooltip>}
        >
          <span>
            <PlusIcon />
          </span>
        </OverlayTrigger>
      );
      break;
    case 3:
        diffstyle = "diif-change"
        diffIndicator = (
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>changed in diff</Tooltip>}
        >
          <span>
            <PencilIcon />
          </span>
        </OverlayTrigger>
      );
      break;
    default:
      break;
  }
  const revertmodle  =   (<td className={"change-entry-row-actions"}>
             <ConfirmationModal show={show} onHide={onHide}
                         msg={`Are you sure you wish to revert "${change.path}" (${diffstyle})?`}
              onConfirm={ revert? () => revert(change) : undefined}/>
  </td>)
    return(
        <>
      <tr className="change-entry-row changetb">
        <td className={`tree-path ${diffstyle}`}>
        <FileIcon />
          <span>{button}</span>
        </td>
        <td>path:<code>{'/'}{change.path}</code></td>
        <td className="diff-indicator">{diffIndicator}</td>
        {revert && <td>revert:<Button variant="link" disabled={false}
                        onClick={(e) => {
                            e.preventDefault();
                            setShow(!show)
                        }}>
                    <HistoryIcon/>
                </Button></td>}
      </tr>
      {revert && revertmodle}

        </>
    )
}


const ChangeList = ({changes,revert=''}) =>{
    let body = 
    changes.length === 0?
     ( <div className="tree-container">
          <Alert variant="info">No changes</Alert>
      </div>):(<>
    <Table borderless size="sm">
      <tbody>
      {changes.map((change)=>{
        return <ChangeRow change={change} revert = {revert}/>
    })}
      </tbody>
    </Table>
  </>)  
    return(
        <>
        <div className="tree-container">
      <Card>
        <Card.Header>
            <strong>Changes</strong>
        </Card.Header>
        <Card.Body>{body}</Card.Body>
      </Card>
    </div>
        </>
    )
}

export default ChangeList