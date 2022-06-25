const randomString = (length: number) => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

export const genFtaa = () => {
  const ftaa = randomString(18);
  return ftaa;
};

export const genBfaa = () => {
  return "f1b3f18c715565b589b7823cda7448ce";
};
