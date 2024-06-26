import React from 'react';
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/reducers/AuthReducer";
import queryString from 'querystring'
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom'; // useHistory 대신 useNavigate 추가

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate를 통해 네비게이션을 수행할 수 있음

  const submit = async (values: { email: any; password: any; }) => {
    const { email, password } = values;
    try {
      const { data } = await api.post('/api/auth/signin', { email, password });
      console.log(data);

      dispatch(setToken(data.jwt))
      const { redirectUrl } = queryString.parse(window.location.search);

      if (redirectUrl && typeof redirectUrl === 'string') {
        navigate(redirectUrl); // 문자열일 경우에만 navigate 호출
      } else {
        navigate('/'); // 그 외의 경우 기본 경로로 이동
      }

      toast.success('로그인하였습니다.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err: any) {
      console.log(err.toString());
      toast.error('로그인에 실패하였습니다. 다시 시도하세요', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-center my-3">
        <h2>로그인</h2>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={submit}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .email("이메일형식으로 입력하세요")
                .required("필수필드 입니다."),
              password: Yup.string()
                .required("필수필드 입니다.")
            })}>
            {
              ({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting
              }) => (<Form onSubmit={handleSubmit}>
                <Form.Group controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control name="email" placeholder="Enter email"
                    value={values.email}
                    onChange={handleChange} onBlur={handleBlur}
                    isValid={touched.email && !errors.email}
                    isInvalid={touched.email && errors.email ? true : false} />
                  {touched.email && !errors.email &&
                    <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>}
                  {touched.email && errors.email &&
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>}
                </Form.Group>
                <Form.Group controlId="formGroupPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" placeholder="enter Password"
                    value={values.password}
                    onChange={handleChange} onBlur={handleBlur}
                    isValid={touched.password && !errors.password}
                    isInvalid={touched.password && errors.password ? true : false} />
                  {touched.password && !errors.password &&
                    <Form.Control.Feedback type="valid">Looks good!</Form.Control.Feedback>}
                  {touched.password && errors.password &&
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>}
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="link" onClick={() => navigate('/sign-up')}>
                    Sign Up
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Submit
                  </Button>
                </div>
              </Form>)
            }
          </Formik>
        </Col>
      </Row>
    </>
  );
}

export default Login;
