import apiClient from ".";
import { type ITrade } from "@/types";

export const getTrades = async () => {
  const response = await apiClient.get<ITrade[]>("/trades");
  return response.data;
};

export const getTradeById = async (id: string) => {
  const response = await apiClient.get<ITrade>(`/trades/${id}`);
  return response.data;
};

export const createTrade = async (tradeData: FormData) => {
  const response = await apiClient.post<ITrade>("/trades", tradeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateTrade = async (id: string, tradeData: FormData) => {
  const response = await apiClient.put<ITrade>(`/trades/${id}`, tradeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteTrade = async (id: string) => {
  const response = await apiClient.delete(`/trades/${id}`);
  return response.data;
};
