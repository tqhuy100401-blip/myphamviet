// Helper functions for managing cart in localStorage
import logger from './logger';

const CART_KEY = "guest_cart";

export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    logger.error("Error reading guest cart:", error);
    return [];
  }
};

export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    logger.error("Error saving guest cart:", error);
  }
};

export const addToGuestCart = (product, quantity = 1) => {
  const cart = getGuestCart();
  const existingIndex = cart.findIndex(item => item.product._id === product._id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  saveGuestCart(cart);
  return cart;
};

export const removeFromGuestCart = (productId) => {
  const cart = getGuestCart();
  const updatedCart = cart.filter(item => item.product._id !== productId);
  saveGuestCart(updatedCart);
  return updatedCart;
};

export const updateGuestCartQuantity = (productId, quantity) => {
  const cart = getGuestCart();
  const item = cart.find(item => item.product._id === productId);
  
  if (item) {
    item.quantity = quantity;
    saveGuestCart(cart);
  }
  
  return cart;
};

export const clearGuestCart = () => {
  localStorage.removeItem(CART_KEY);
};

export const getGuestCartCount = () => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const getGuestCartTotal = () => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};
