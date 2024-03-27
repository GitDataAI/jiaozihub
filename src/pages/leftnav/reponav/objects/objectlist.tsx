import { FileIcon} from "@primer/octicons-react";
import React, { useRef, useState } from "react"
import { GoFileDirectoryFill } from "react-icons/go";
import { useRouter } from "../../../../lib/hooks/router";
import { cache } from "../../../../lib/api";
import { Link } from "../../../../lib/components/nav";
import { AiFillCaretDown,AiFillCaretRight } from "react-icons/ai";
import { useAPI } from "../../../../lib/hooks/api";
import { AlertError, Loading } from "../../../../lib/components/controls";
import { repos } from "../../../../lib/api/interface";


const EntryRow = ({repo, reference, entry}) => {
    const [show,setShow] = useState(false)
    const {commitId} = useRouter().query
    const [children,SetChildren] = useState<React.JSX.Element>()

    
    const fNode = useRef()
    let fileClass = "Nav-file";
    let dirClass = "Nav-dir";
    let buttonText = entry.name
    const user = cache.get('user')
    const params = { repoId: repo.name,user };
    const query = { ref: reference.name, path:(entry.fathername?entry.fathername+ '/' :'' )+ entry.name,type:reference.type};
    
    const handleClick = ()=>{
      setShow(!show)
    }
    const ChildEntryRow = ()=>{
      if(show && !children && entry.is_dir){
        const {response,loading,error} = useAPI(()=>{return repos.getEntriesInRef(user, repo.name, { path: (entry.fathername?entry.fathername+ '/':'' ) + entry.name,type: reference.type, ref: reference.name });})
        if(loading) return <Loading/>
        if(error) return <AlertError error={error}></AlertError>
        
        const child = response.data.map((item)=>{
          return {...item, fathername: (entry.fathername?entry.fathername+'/':'') +entry.name}
        })
        const Row =(
        <div className="Child-nav">
        { child.map((item)=>{          
          return <EntryRow repo={repo} reference={reference} entry={item} />
        })}
        </div>)
        SetChildren(Row)
        
        return Row
      }else{
        
        return children
      }
    }
    let button;
    if(commitId && entry.is_dir){
      const filePathQuery = {
        ref: query.ref,
        path: query.path,
        type: query.type,
        is_dir: entry.is_dir,
        commitId:commitId
      }
      button = (
        <Link
          href={{
            pathname: "/repositories/:user/:repoId/objects",
            query: filePathQuery,
            params: params,
          }}
        >
          {buttonText}
        </Link>
      )
    }else if(entry.is_dir){
      const filePathQuery = {
        ref: query.ref,
        path: query.path,
        type: query.type,
        is_dir: entry.is_dir
      }
      button = (
        <Link
          href={{
            pathname: "/repositories/:user/:repoId/objects",
            query: filePathQuery,
            params: params,
          }}
        >
          {buttonText}
        </Link>
      )
    }
    else {
    const filePathQuery = {
        ref: query.ref,
        path: query.path,
        type: query.type
      };
      button = (
        <Link
          href={{
            pathname: "/repositories/:user/:repoId/object",
            query: filePathQuery,
            params: params,
          }}
        >
          {buttonText}
        </Link>
      );
    }

  
      let diffstyle;
    switch (entry.action) {
      case 2:
        break;
      case 1:
        diffstyle = "diif-add"
        break;
      case 3:
        diffstyle = "diif-change"
        break;
      default:
        diffstyle = "tree-path"
        break;
    }
  
    return (
      <>
        <div className={entry.is_dir?dirClass:fileClass} ref={fNode}>
          <div className={diffstyle}>
          <span onClick={handleClick}>{entry.is_dir === true ? (
            <>
              {show?<AiFillCaretDown  className="Nav-Down"/>:<AiFillCaretRight  className="Nav-Down"/>}
              <GoFileDirectoryFill className="Nav-Dir"/>
            </>
            ) : (
              <FileIcon />
            )}
            {button}</span>
           {show && <ChildEntryRow/>}
          </div>
        </div>
      </>
    );
  }
export const Objectlist =({entrises,repo,reference})=>{
    return (
        <>
        {   
            entrises.map((entry)=>{
               return <EntryRow key={entry.hash} entry={entry} repo={repo} reference={reference} />
            })
        }
        </>
    )
}