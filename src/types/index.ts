export interface ITrade {
  _id: string;
  date: Date;
  setupImage: string;
  reason: string;
  status: "open" | "closed";
  entryPrice: number;
  quantity: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  userId: string;
}
