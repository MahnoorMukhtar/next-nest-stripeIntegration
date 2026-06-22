"use client";

import axios from "axios";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart, removeFromCart } from "@/store/features/cartSlice";

const COURSE = {
  courseId: "667d56b2875155f16e8e74c8",
  courseName: "Test Course",
  price: 20,
};

const StripePaymentCard = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const isInCart = cartItems.some((item) => item.courseId === COURSE.courseId);

  const handleAddToCart = () => {
    dispatch(addToCart(COURSE));
  };

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(COURSE.courseId));
  };

  const handleCheckout = () => {
    const userCourseInfo = {
      courseId: COURSE.courseId,
      userId: "666811730068a41e7f825911",
    };

    axios
      .post(
        `http://localhost:3001/api/stripe/create-checkout-session`,
        userCourseInfo,
      )
      .then((res) => {
        if (res.data && res.data.data && res.data.data.url) {
          window.location.href = res.data.data.url;
        }
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {COURSE.courseName}
          </h2>
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Cart: {cartItems.length}
          </span>
        </div>

        <p className="text-3xl font-bold text-gray-900 mb-6">
          ${COURSE.price}.00
        </p>

        {!isInCart ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition cursor-pointer"
            >
              Proceed to Credit Card Payment
            </button>
            <button
              onClick={handleRemoveFromCart}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition"
            >
              Remove from Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripePaymentCard;