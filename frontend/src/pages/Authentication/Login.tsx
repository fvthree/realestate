import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser, socialLogin, resetLoginFlag } from "../../slices/thunks";

import logoLight from "../../assets/images/logo-light.png";
import { createSelector } from 'reselect';
//import images

import "./Login.scss";

const Login = (props: any) => {
    const dispatch: any = useDispatch();

    const selectLayoutState = (state: any) => state;
    const loginpageData = createSelector( selectLayoutState,
        (state) => ({
            user: state.Account.user,
            error: state.Login.error,
            errorMsg: state.Login.errorMsg,
        })
    );
    // Inside your component
    const { user, error, errorMsg } = useSelector(loginpageData);

    const [userLogin, setUserLogin] = useState<any>([]);
    const [passwordShow, setPasswordShow] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);


    useEffect(() => {
        if (user && user) {
            const updatedUserData = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? user.multiFactor.user.email : user.email;
            const updatedUserPassword = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? "" : user.confirm_password;
            setUserLogin({
                email: updatedUserData,
                password: updatedUserPassword
            });
        }
    }, [user]);

    const validation: any = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            email: userLogin.email || "agent@example.com" || '',
            password: userLogin.password || "password123" || '',
        },
        validationSchema: Yup.object({
            email: Yup.string().required("Please Enter Your Email"),
            password: Yup.string().required("Please Enter Your Password"),
        }),
        onSubmit: (values) => {
            dispatch(loginUser(values, props.router.navigate));
            setLoader(true)
        }
    });

    const signIn = (type: any) => {
        dispatch(socialLogin(type, props.router.navigate));
    };


    //for facebook and google authentication
    const socialResponse = (type: any) => {
        signIn(type);
    };


    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
                setLoader(false)
            }, 3000);
        }
    }, [dispatch, errorMsg]);

    document.title = "Sign In | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content mt-lg-5">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="login-header text-center mt-sm-5 mb-4">
                                    {/*<div>*/}
                                    {/*    <Link to="/" className="d-inline-block auth-logo">*/}
                                    {/*        <img src={logoLight} alt="Velzon" height="24" className="logo-img" />*/}
                                    {/*    </Link>*/}
                                    {/*</div>*/}
                                    {/*<p className="mt-3 fs-15 fw-medium">Premium Admin Dashboard</p>*/}
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="login-card mt-4">
                                    <CardBody className="p-0">
                                        <div className="login-card-header">
                                            <div className="text-center">
                                                <h4 className="login-title fw-bold">Welcome Back!</h4>
                                                <p className="login-subtitle">Sign in to your account to continue</p>
                                            </div>
                                        </div>

                                        {(error || errorMsg) && (
                                            <Alert color="danger" className="mx-4 mt-4 alert-dismissible fade show" role="alert">
                                                <i className="ri-error-warning-line me-2"></i>
                                                {typeof error === 'string' ? error : (error?.message || error?.data || "Login failed. Please check your credentials.")}
                                            </Alert>
                                        )}

                                        <div className="login-form-container p-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                action="#">

                                                <div className="mb-4">
                                                    <Label htmlFor="email" className="form-label fw-500">Email Address</Label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text bg-light border-0">
                                                            <i className="ri-mail-line"></i>
                                                        </span>
                                                        <Input
                                                            name="email"
                                                            className="form-control form-control-lg border-0"
                                                            placeholder="name@example.com"
                                                            type="email"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.email || ""}
                                                            invalid={
                                                                validation.touched.email && validation.errors.email ? true : false
                                                            }
                                                        />
                                                    </div>
                                                    {validation.touched.email && validation.errors.email ? (
                                                        <FormFeedback className="mt-2 d-block">
                                                            <i className="ri-error-warning-line me-1"></i>
                                                            {validation.errors.email}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-4">
                                                    <Label className="form-label fw-500" htmlFor="password-input">Password</Label>
                                                    <div className="input-group input-group-lg position-relative auth-pass-inputgroup">
                                                        <span className="input-group-text bg-light border-0">
                                                            <i className="ri-lock-line"></i>
                                                        </span>
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
                                                            className="form-control form-control-lg border-0 pe-5"
                                                            placeholder="Enter your password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        <button
                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-toggle"
                                                            type="button"
                                                            id="password-addon"
                                                            onClick={() => setPasswordShow(!passwordShow)}>
                                                            <i className={`ri-eye${!passwordShow ? '-off' : ''}-line`}></i>
                                                        </button>
                                                    </div>
                                                    {validation.touched.password && validation.errors.password ? (
                                                        <FormFeedback className="mt-2 d-block">
                                                            <i className="ri-error-warning-line me-1"></i>
                                                            {validation.errors.password}
                                                        </FormFeedback>
                                                    ) : null}
                                                    <div className="d-flex align-items-center justify-content-between mt-3">
                                                        <div className="form-check mb-0" style={{ width: '100%' }}>
                                                            <Input className="form-check-input ms-3" type="checkbox" value="" id="auth-remember-check" />
                                                            <Label className="form-check-label"  style={{ marginLeft: '40px' }} htmlFor="auth-remember-check">Remember me</Label>
                                                        </div>
                                                        <Link to="/forgot-password" className="link-primary text-decoration-none fs-13" style={{ width: '50%' }}>Forgot Password?</Link>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <Button
                                                        disabled={loader}
                                                        className="btn btn-primary w-100 btn-lg fw-500 signin-btn"
                                                        type="submit">
                                                        {loader && <Spinner size="sm" className='me-2'> Loading... </Spinner>}
                                                        {!loader && 'Sign In'}
                                                    </Button>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <div className="signin-other-title position-relative mb-4">
                                                        <span className="bg-light px-2 text-muted">Or continue with</span>
                                                    </div>
                                                    <div className="social-login-buttons">
                                                        <Link
                                                            to="#"
                                                            className="btn btn-outline-primary btn-icon rounded-circle"
                                                            title="Facebook"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                socialResponse("facebook");
                                                            }}
                                                        >
                                                            <i className="ri-facebook-fill fs-18" />
                                                        </Link>
                                                        <Link
                                                            to="#"
                                                            className="btn btn-outline-danger btn-icon rounded-circle"
                                                            title="Google"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                socialResponse("google");
                                                            }}
                                                        >
                                                            <i className="ri-google-fill fs-18" />
                                                        </Link>
                                                        <Button color="white" outline className="btn-icon rounded-circle" title="GitHub">
                                                            <i className="ri-github-fill fs-18"></i>
                                                        </Button>
                                                        <Button color="white" outline className="btn-icon rounded-circle" title="Twitter">
                                                            <i className="ri-twitter-fill fs-18"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>

                                <div className="mt-4 text-center">
                                    <p className="mb-0 text-muted">Don't have an account?
                                        <Link to="/register" className="fw-semibold text-primary text-decoration-none ms-2">
                                            Create one now
                                        </Link>
                                    </p>
                                </div>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
        </React.Fragment>
    );
};

export default withRouter(Login);