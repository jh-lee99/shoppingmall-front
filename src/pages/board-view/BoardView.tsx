import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Row } from "react-bootstrap";
import { Board } from "../../dto/Board";
import CommentList from "../../components/CommentList";
import api from "../../utils/api";
import { jwtUtils } from "../../utils/JwtUtils";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom"; // useParams, useNavigate 추가
import { useSelector } from 'react-redux';

const MyComponent: React.FC = () => {
  const [board, setBoard] = useState<Board>({
    title: '',
    content: ''
  });
  const token = useSelector((state: any) => state.Auth.token);
  const { id } = useParams<{ id: string }>(); // id의 타입을 명시적으로 지정
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동을 처리함

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (id) { // id가 정의되어 있는 경우에만 실행되도록 조건 추가
      getBoard(id);
    }
  }, [id]); 

  const getBoard = async (id: string) => {
    try {
      const res = await api.get(`/api/board/${id}`);
      setBoard(res.data);
    } catch (error) {
      console.error('Error fetching board:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/api/board?id=${id}`);
      setShow(false);
      navigate('/board-list'); // 페이지 이동
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  }

  return (
    <>
      {jwtUtils.isAuth(token) && jwtUtils.getId(token) === board?.user?.id &&
        <div className="d-flex justify-content-end">
          <Button variant="info" onClick={() => navigate(`/board-edit/${id}`)}>수정</Button>
          <Button variant="danger" onClick={() => handleShow()}>삭제</Button>
        </div>
      }
      <div className="d-flex justify-content-between mt-3">
        <h5>{board?.user?.username}</h5>
        <h5>{moment(board?.created).format('YYYY-MM-DD')}</h5>
      </div>
      <Card className="p-3 my-3">
        <Card.Title className="pb-2" style={{ borderBottom: '1px solid #dddddd' }}>{board?.title}</Card.Title>
        <Card.Text>
          {board?.content}
        </Card.Text>
      </Card>
      <CommentList board_id={parseInt(id!)} history={undefined}></CommentList>
      <Row className="justify-content-center mt-3">
        <Button variant="primary" onClick={() => navigate(-1)}>돌아가기</Button>
      </Row>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>삭제</Modal.Title>
        </Modal.Header>
        <Modal.Body>삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MyComponent;
