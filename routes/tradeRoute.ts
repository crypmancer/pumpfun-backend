import TokenModel from "../model/TokenModel";
import TradeModel from "../model/TradeModel";

interface Trade {
  token: string;
  price: number;
  timestamp: string;
  volume: number;
  supply: number;
}

export const getCurrentFormattedDateTime = (convertdate?: number) => {
  const date = convertdate?new Date(convertdate):new Date();

  // Extract year, month, day, hours, minutes, and seconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format into the desired string
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
};

export const updatePermins = async () => {
  const tokens = await TokenModel.find({});
  const currentTime = getCurrentFormattedDateTime();
  console.log(
    `--------------updating token dates--------------\nCurrent time => ${currentTime}`
  );
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const newTrade = new TradeModel({
      token: token.address,
      price: token.price,
      timestamp: currentTime,
      volume: token.marketcap,
      supply: token.supply,
    });
    await newTrade.save();
  }
};

export const parseTimestamp = (timestampString: string) => {
  const [datePart, timePart] = timestampString.split(" ");
  const [year, month, day] = datePart.split("-");
  const [hour, minute, second] = timePart.split(":");
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

// Function to filter data within the last 10 days
export const filterLast10Days = async (data: Trade[]) => {
  const now = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(now.getDate() - 10);

  return data.filter((item: Trade) => {
    const itemDate = parseTimestamp(item.timestamp);
    return itemDate >= tenDaysAgo && itemDate <= now;
  });
}
