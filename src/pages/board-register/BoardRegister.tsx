import React, { useState } from 'react';
import { Button, Form } from "react-bootstrap";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { jwtUtils } from "../../utils/JwtUtils";
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

const BoardRegister: React.FC = () => {
  const [validated, setValidated] = useState(false);
  const token = useSelector((state: any) => state.Auth.token);
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setValidated(false);
      return;
    }

    setValidated(true);
    const board = {
      title: form.titleInput.value,
      content: form.contentText.value,
      user_id: jwtUtils.getId(token)
    };

    await addBoard(board);
  };

  const addBoard = async (board: any) => {
    try {
      const res = await api.post('/api/board', board);
      console.log(res);
      navigate('/board-list'); // 페이지 이동
    } catch (error) {
      console.error('Error adding board:', error);
    }
  }

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group controlId="titleInput">
        <Form.Label>제목</Form.Label>
        <Form.Control required placeholder="" />
        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        <Form.Control.Feedback type="invalid">제목을 입력하세요!!</Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="contentText">
        <Form.Label>내용</Form.Label>
        <Form.Control required as="textarea" rows={20} />
        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        <Form.Control.Feedback type="invalid">내용을 입력하세요!!</Form.Control.Feedback>
      </Form.Group>
      <Button variant="primary" type="submit">
        저장
      </Button>
    </Form>
  );
};

export default BoardRegister;
