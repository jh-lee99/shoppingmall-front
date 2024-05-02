import React, { useEffect, useState } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import { Sales } from "../../dto/Sales";
import './SalesList.scss';
import { StringUtils } from "../../utils/StringUtils"; // 한글화
import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
})

// const bucketname = process.env.REACT_APP_BUCKET_NAME || '';

declare global {
  interface Window {
    IMP: any
  }
}
const IMP = window.IMP;

IMP.init("imp63852103");

const SalesList: React.FC = () => {
  // 로컬 상품 목록을 저장할 상태
  const [salesList, setSalesList] = useState<Sales[]>([]);

  useEffect(() => {
    getSalesDataFromS3();
  }, []);

  const getSalesDataFromS3 = async () => {
    try {
      // AWS SDK의 S3 인스턴스 생성
      const s3 = new AWS.S3();
      console.log(process.env.REACT_APP_BUCKET_NAME);
      console.log(process.env.REACT_APP_BUCKET_NAME);
      console.log(process.env.REACT_APP_AWS_REGION);
      console.log(process.env.REACT_APP_AWS_ACCESS_KEY_ID);
      console.log(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
  
      const bucketName = process.env.REACT_APP_BUCKET_NAME;

      if (typeof bucketName !== 'string') {
        console.error('REACT_APP_BUCKET_NAME 환경변수가 설정되지 않았습니다.');
        return;
      }

      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: bucketName,
      };

      // S3.listObjectsV2 메서드를 사용하여 버킷 내 모든 객체를 가져옴
      // const params: AWS.S3.ListObjectsV2Request = {
      //   Bucket: process.env.REACT_APP_BUCKET_NAME,
      // };
      const data = await s3.listObjectsV2(params).promise();
  
      // data.Contents가 undefined인 경우에 대한 처리
      if (!data.Contents) {
        throw new Error('No contents found in the S3 bucket');
      }
  
      // 가져온 객체 목록을 기반으로 salesData 배열 생성
      const salesList: Sales[] = await Promise.all(data.Contents.map(async (obj) => {
        if (!obj.Key) {
          throw new Error('Object key is undefined');
        }

        // S3 객체의 메타데이터 가져오기
        const metadataParams = {
          Bucket: bucketName,
          Key: obj.Key,
        };
        const metadataResponse = await s3.getObject(metadataParams).promise();
        // const metadata = await s3.headObject(metadataParams).promise();
        const price = metadataResponse.Metadata?.price ?? 'Unknown';
        console.log(metadataResponse);
  
        return {
          production: obj.Key.split('.').slice(0, -1).join('.'), // 파일 이름을 production으로 사용 (확장자 제외)
          image: `https://${params.Bucket}.s3.amazonaws.com/${obj.Key}`, // 이미지 URL 생성
          price: parseInt(price),        
        };
      }));
  
      // salesList 상태에 설정
      setSalesList(salesList);
    } catch (error) {
      console.error('Error fetching sales data from S3:', error);
    }
  };
  
  const handleImageClick = async (sales: Sales) => {
    try {
      const merchant_uid = generateMerchantUid();

      const response: any = await new Promise((resolve, reject) => {
        IMP.request_pay({
          pg: "kakaopay",
          pay_method: "card",
          amount: String(sales.price),
          name: sales.production,
          merchant_uid: merchant_uid
        }, (response: any) => {
          resolve(response);
        });
      });

      const { status, err_msg, imp_uid } = response;
      if (err_msg) {
        alert(err_msg);
      }
      if (status === "paid") {
        await verifyPayment(imp_uid);
      }
    } catch (error) {
      console.error('Error handling payment:', error);
    }
  };

  const verifyPayment = async (imp_uid: string) => {
    try {
      const response = await fetch('/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imp_uid })
      });
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      console.log('Payment verification successful:', data);
    } catch (error: any) {
      console.error('Error verifying payment:', error.message);
    }
  };

  const generateMerchantUid = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `ORD${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
  };

  return (
    <>
      <Row>
        {salesList.map((sales: any, index: any) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-3">
            <Card style={{ width: '18rem' }}>
              <Card.Img src={sales.image} alt={sales.production} onClick={() => handleImageClick(sales)} />
              <Card.Body>
                <Card.Title>{sales.production}</Card.Title>
                <Card.Text>가격: ${sales.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );

};

export default SalesList;
