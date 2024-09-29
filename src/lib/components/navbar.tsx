import React from "react";
import {auth, cache} from "../api";
import {Link} from "./nav";
import {Navbar, NavDropdown} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {FeedPersonIcon} from "@primer/octicons-react";
import './style/index.scss'


const NavUserInfo = () => {
    const user = cache.get("user")
    const logoutUrl = "/login"


    const NavBarTitle = () => {
        return (
        <>
            {/* {<div className="user-menu-notification-indicator"></div>} */}
            <FeedPersonIcon size={28} verticalAlign={"middle"}/><strong >{user} </strong>
        </>
        )
    }
    return (
        <NavDropdown title={<NavBarTitle />} className="navbar-username" align="end">
            <NavDropdown.Item
                onClick={async()=> {
                    auth.clearCurrentUser();
                    window.location = logoutUrl;
                    await auth.logout();
                }}>
                Logout
            </NavDropdown.Item>
        </NavDropdown>
    );
};


const TopNav = ({logged = true}) => {
    if (!logged) {
        return (
            <Navbar variant="dark" expand="md">
            <Container fluid={true}>
            {/* <div className="jiaozi-nav">
                <a href=""><img style={{width:"30px"}} src="/pub/logo192.png" /></a>
                </div> */}
            {/* <div className="jiaozi-btncol">
                <Button><div className="jiaozi-btndiv" ><AiFillRedditSquare /><span>Discord</span></div></Button>
                <Button><div className="jiaozi-btndiv"><AiFillGithub /><span><AiOutlineStar /> 15.9k</span></div></Button>
                <Button><span style={{ backgroundColor : "#f1f3f8"}}> <a href="/127.0.0.1.3000/auth" target="_blank">Sign in <br /> &nbsp;</a></span></Button>                
                </div> */}
            </Container>
            </Navbar>
        );
    }
    return (
        <Navbar  expand="md" className="topNav">
            <Container fluid={true}>
                <Link component={Navbar.Brand} href="/">
                    <img src="/jiaozifs.png" alt="JiaoziFS" className="logo"/>
                    <strong>JZFS Cloud</strong>
                </Link>
                <NavUserInfo/>
            </Container>
        </Navbar>
    );
};

export default TopNav;
