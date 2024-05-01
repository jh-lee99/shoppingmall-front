import React, { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Board } from "../../dto/Board";
import './BoardList.scss';
import api from "../../utils/api";
import { StringUtils } from "../../utils/StringUtils";
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

const BoardList: React.FC = () => {
  const [boardList, setBoardList] = useState([]);
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    getBoardList();
  }, []);

  const getBoardList = async () => {
    try {
      const res = await api.get('/api/board/list');
      setBoardList(res.data);
    } catch (error) {
      console.error('Error fetching board list:', error);
    }
  }

  return (
    <>
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <Button variant="primary" onClick={() => navigate('/board-register')}>등 록</Button>
        </Col>
      </Row>
      {
        boardList.map((board: Board) =>
          <Row className="py-2 board" key={board.id} onClick={() => navigate(`/board-view/${board.id}`)}>
            <Col xs={8}>{board.title}</Col>
            <Col xs={2} className="text-right">{board.user?.username}</Col>
            <Col xs={2} className="text-right">{StringUtils.getRecentDate(board.created)}</Col>
          </Row>)
      }
    </>
  );
};

export default BoardList;
