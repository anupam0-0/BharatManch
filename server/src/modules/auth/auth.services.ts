// path: modules/auth/auth.services.ts

import authRepo from "./auth.repo.ts";
import type { PrismaClient } from "../../generated/prisma/client";
import type { SignInInput, SignUpInput } from "./auth.schema";
import { AppError } from "../../utils/errors/app-error";

const userSignup = async (prisma: PrismaClient, input: SignUpInput) => {
  const email = input.email.trim().toLowerCase();
  
  const existingUser = await authRepo.getUserWithPasswordByEmail(prisma, email);

  if (existingUser) {
    throw new AppError("CONFLICT", "User already exists");
  }

  const password = await Bun.password.hash(input.password);

  return authRepo.createUserWithChannel(prisma, {
    ...input,
    email,
    password,
  });
};

const userSignIn = async (prisma: PrismaClient, input: SignInInput) => {
  const email = input.email.trim().toLowerCase();

  // take userinput, check email exits, verify password, create jwt, reply
  const user = await authRepo.getUserWithPasswordByEmail(prisma, email);

  if (!user) {
    throw new AppError("UNAUTHORIZED", "Invalid email or password");
  }

  // call a service called matchpasssword
  const isMatch = await Bun.password.verify(input.password, user.password);
  if (!isMatch) {
    throw new AppError("UNAUTHORIZED", "Invalid email or password");
  }

  return user;
};


const getMe = async (prisma: PrismaClient, userId: string) => {
  const user = await authRepo.getUserById(prisma, userId);

  if (!user) {
    throw new AppError("NOT_FOUND", "User not found!");
  }

  return user;
};

export default {
  userSignup,
  userSignIn,
  getMe,
};
