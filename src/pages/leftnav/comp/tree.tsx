import React, { useContext } from "react";
import { Col } from "react-bootstrap";
import { ActivepageContext } from "../../../lib/hooks/conf";
import { useRouter } from "../../../lib/hooks/router";
import { useAPI } from "../../../lib/hooks/api";
import { AlertError, Loading } from "../../../lib/components/controls";
import { useRefs } from "../../../lib/hooks/repo";

const NavTreeContent = ({ reference,repo,api,List,tittle }) => {
  let { user, repoId } = useRouter().params;
  const {refresh} = useContext(ActivepageContext)

  let {
    response,
    loading: load,
    error: err
  } = useAPI(async ()=>await api(user, repoId, { ref: reference.name, type: reference.type }),[refresh]);
  if (load) return <Loading />;
  if (err) return <AlertError error={err} />;
  return (
    <>
    <Col className="d-flex">
    <strong className="Navtittle">{tittle}</strong>
    </Col>
    <List entrises={response.data} repo={repo} reference={reference} />
    </>
  );
};

export const Tree = ({api,List,tittle}) => {
  const {repo, reference, loading, error } = useRefs();
  
  
  if (loading) return <Loading />;
  if (error) return <AlertError error={error} />;
  
  return <NavTreeContent reference={reference} repo={repo} api={api} List={List} tittle={tittle}/>;
};