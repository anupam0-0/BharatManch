import { Prisma, type PrismaClient } from "../../generated/prisma/client";
import type { SignUpInput } from "./auth.schema";
import { AppError } from "../../utils/errors/app-error";

const slugifyHandle = (value: string) =>
      value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9_-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");

// 
const publicUserSelect = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
} as const;

// get user by email
const getUserByEmail = async (prisma: PrismaClient, email: string) => {
      return prisma.user.findUnique({
            where: { email },
            select: publicUserSelect,
      });
};

// get user w/o password by email
const getUserWithPasswordByEmail = async (
      prisma: PrismaClient,
      email: string,
) => {
      return prisma.user.findUnique({
            where: { email },
      });
};

// create user return no password (to be removed later)
const createUser = async (prisma: PrismaClient, user: SignUpInput) => {
      const { handle: _handle, ...userData } = user;
      return prisma.user.create({
            data: userData,
            select: publicUserSelect,
      });
};

// create user + channel (new one) : transaction
const createUserWithChannel = async (
      prisma: PrismaClient,
      userPayload: SignUpInput,
) => {
      const { handle, ...userData } = userPayload;
      const channelHandle = slugifyHandle(handle);

      if (!channelHandle) {
            throw new AppError("VALIDATION_ERROR", "Invalid handle");
      }

      try {
            return await prisma.$transaction(async (tx) => {
                  const newUser = await tx.user.create({
                        data: userData,
                        select: publicUserSelect,
                  });

                  await tx.channel.create({
                        data: {
                              handle: channelHandle,
                              name: `${userData.firstName} ${userData.lastName}`.trim(),
                              links: [],
                              userId: newUser.id,
                        },
                  });

                  return newUser;
            });
      } catch (error) {
            if (
                  error instanceof Prisma.PrismaClientKnownRequestError &&
                  error.code === "P2002"
            ) {
                  const target = Array.isArray(error.meta?.target)
                        ? error.meta?.target
                        : undefined;

                  if (target?.includes("handle")) {
                        throw new AppError("CONFLICT", "Handle already exists");
                  }

                  if (target?.includes("email")) {
                        throw new AppError("CONFLICT", "Email already exists");
                  }

                  throw new AppError("CONFLICT", "User already exists");
            }

            throw error;
      }
};


// get user by id
const getUserById = async (prisma: PrismaClient, id: string) => {
      return prisma.user.findUnique({
            where: { id },
            select: publicUserSelect,
      });
};

export default {
      getUserByEmail,
      getUserWithPasswordByEmail,
      createUser,
      createUserWithChannel,
      getUserById,
};
