// src/config/alchemy.js

import { Alchemy } from "alchemy-sdk";

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: "eth-mainnet",
};

export const alchemy = new Alchemy(settings);

// ✅ Utility functions
export const formatEther = (wei) => {
  return (parseFloat(wei) / 1e18).toFixed(4);
};

export const formatBalance = (wei) => {
  return (parseFloat(wei) / 1e18).toFixed(6);
};

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

// ✅ Fix: add truncateHash here
export const truncateHash = (hash) => {
  if (!hash) return "";
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
};
