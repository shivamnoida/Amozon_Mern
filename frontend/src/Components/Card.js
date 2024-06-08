import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Rating from "@material-ui/lab/Rating";
import { useStateValue } from "../StateProvider";

function Card({ id, image, title, price, rating }) {
  const [{ basket }, dispatch] = useStateValue();
  const [showAlert, setShowAlert] = useState(false);

  const addToBasket = (e) => {
    e.preventDefault();
    setShowAlert(true);

    dispatch({
      type: "ADD_TO_BASKET",
      item: {
        id,
        title,
        price,
        image,
        rating,
      },
    });
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <Container>
      {showAlert && <Alert> Added on Cart</Alert>}
      <Image>
        <img src={image} alt={title} />
      </Image>
      <Description>
        <h5>{title}</h5>
        <Rating
          name="half-rating-read"
          defaultValue={rating}
          precision={0.5}
          readOnly
        />
        <p>₹ {price}</p>
        <button onClick={addToBasket}>Add to Cart</button>
      </Description>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  z-index: 10;
  position: relative;
`;

const Alert = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 100;
`;

const Image = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  flex: 0.3;
  img {
    width: 180px;
    height: 200px;
  }
`;

const Description = styled.div`
  width: 90%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 0.7;

  h5 {
    font-size: 16px;
    font-weight: 600;
  }

  p {
    font-weight: 600;
  }

  button {
    width: 100%;
    height: 33px;
    background-color: #fa8900;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
`;

export default Card;
