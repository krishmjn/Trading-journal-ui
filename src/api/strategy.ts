import apiClient from ".";
import { type IStrategy } from "@/types";

export const getStrategies = async (date?: string, sort?: string) => {
  const response = await apiClient.get<IStrategy[]>("/strategies", {
    params: { date, sort },
  });
  return response.data;
};

export const getStrategyById = async (id: string) => {
  const response = await apiClient.get<IStrategy>(`/strategies/${id}`);
  return response.data;
};

export const createStrategy = async (strategyData: {
  date: string;
  content: string;
}) => {
  const response = await apiClient.post<IStrategy>(
    "/strategies",
    strategyData
  );
  return response.data;
};

export const updateStrategy = async (
  id: string,
  strategyData: { date?: string; content?: string }
) => {
  const response = await apiClient.put<IStrategy>(
    `/strategies/${id}`,
    strategyData
  );
  return response.data;
};

export const deleteStrategy = async (id: string) => {
  const response = await apiClient.delete(`/strategies/${id}`);
  return response.data;
};
