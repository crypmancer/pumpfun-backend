export interface IStakingResult {
  user: string;
  count: bigint;
  stakedAmount: bigint;
  time: bigint;
  period: bigint;
}

export interface IUser {
  _id: string;
  username: string;
  walletAddress: string;
  tokenBalance: number;
  created_at: Date;
  role: number;
  avatar?: string | null | undefined;
  referrerId?: string | null | undefined;
}