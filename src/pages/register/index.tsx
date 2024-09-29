import React, { useState } from "react"
import Layout from "../../lib/components/layout"
import { useRouter } from "../../lib/hooks/router";
import { Card, Col, Form, Row } from "react-bootstrap";
import { users } from "../../lib/api/interface/index";
import { AlertError } from "../../lib/components/controls";
import LoadingButton from '@mui/lab/LoadingButton';
const RegisterForm = () => {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [RegisterError, setRegisterError] = useState<React.ReactElement | null>(null);
    const { next } = router.query;
    const reghandleclick = (e) =>{
        e.preventDefault();
        router.push('/register')
    }
    const loghandleclick = (e) =>{
        e.preventDefault();
        router.push('/login')
    }
    return(
            <Row className="justify-content-center align-items-center gx-0">
             <Col className="login-box" >
             <div className="titleword">Register</div>
            <Card className="login-widget jiaozi-login register">
            <Card.Header> <a href="" onClick={loghandleclick}>Sign In</a> <a href="#" onClick={reghandleclick} className="active">Create Account</a></Card.Header>
                <Card.Body>
                    <Form onSubmit={async (e) => {
                         // Anti shake operation
                        e.preventDefault()
                        setLoading(true);
                       
                        const form = e.target as HTMLFormElement;
                        const username = form.elements.namedItem('username') as HTMLInputElement;
                        const password = form.elements.namedItem('password') as HTMLInputElement;
                        const email = form.elements.namedItem('email') as HTMLInputElement;
                        setTimeout(async() => {
                            setLoading(false);
                        if(password.value.length<8)
                            {setRegisterError(<span>{'The password must contain at least 8 characters'}</span>)
                        }else if(!email.value)
                            {setRegisterError(<span>{'Please input your e-mail'}</span>)}
                        else if(!username.value)
                            {setRegisterError(<span>{'Please input your username'}</span>)}
                        else if(!password.value)
                            {setRegisterError(<span>{'Please input your password'}</span>)}
                        else{
                            try {
                                await users.register({name: username.value,password:password.value,email:email.value})
                                setRegisterError(null);
                                router.push(next ? next : '/login');
                            } catch(err) {
                                {setRegisterError(<span>{'The request is incorrect'}</span>)}
                            }
                        }
                    }, 1500);
                    }}>
                        <strong>Username<span className="mustword">*</span></strong>
                        <Form.Group controlId="username" className="mb-3">
                            <Form.Control type="text" placeholder={"Access username"} autoFocus/>
                        </Form.Group>
                        <strong>Password<span className="mustword">*</span></strong>
                        <Form.Group controlId="password" className="mb-3">
                            <Form.Control type="password" placeholder={"Access password"}/>
                        </Form.Group>
                        <strong>E-mail<span className="mustword">*</span></strong>
                        <Form.Group controlId="email" className="mb-3">
                            <Form.Control type="email" placeholder={"Access email"}/>
                        </Form.Group>

                        {(!!RegisterError) && <AlertError error={RegisterError}/>}
                        {/* To prevent the button text from being automatically capitalized, add an inline style textTransform: 'none' to the debounce button. */}
                        <LoadingButton style={{width:'100%',marginTop:'2.5vh'}} loadingIndicator="Loading…" loading={loading} variant="contained" type="submit">Register</LoadingButton>
                    </Form>
                </Card.Body>
            </Card>
        </Col>
    </Row>
    )
}

const RegisterPage = ()=>{
    return(
    <Layout logged={false}>
        <RegisterForm />
    </Layout>
    )
}
export default RegisterPage