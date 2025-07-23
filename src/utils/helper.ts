import prisma from "../client";

const generateUsername = async (name: string): Promise<string> => {
  const base = name
    .split(" ")
    .map((part, i) => (i === 0 ? part : part[0]))
    .join("")
    .toLowerCase();

  let username = base;
  let count = 1;

  while (await prisma.employee.findUnique({ where: { username } })) {
    count++;
    username = `${base}${count}`;
  }

  return username;
};

const generateRandomPassword = (length = 8): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export { generateUsername, generateRandomPassword };
