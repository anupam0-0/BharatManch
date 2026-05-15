import z, { parse } from "zod";
import type { PrismaClient } from "../../generated/prisma/client";
import { AppError } from "../../utils/errors/app-error";

const getMyChannelById = async (prisma: PrismaClient, userId: string) => {
      const channel = await prisma.channel.findUnique({
            where: { userId: userId },
      });
      return channel;
};

const getChannelByHandle = async (
      prisma: PrismaClient,
      inputHandle: string,
) => {
      const channel = await prisma.channel.findFirst({
            where: { handle: inputHandle },
      });
      return channel;
};

const getVideosByHandle = async (
      prisma: PrismaClient,
      handle: string,
      page: number,
      limit: number = 30,
) => {
      const channel = await prisma.channel.findFirst({
            where: { handle },
            select: { id: true },
      });

      if (!channel) return null;

      const videos = await prisma.video.findMany({
            where: { channelId: channel.id, visibility: "PUBLIC" },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: (page - 1) * limit,
      });

      return videos;
};

const updateMyChannel = async (
      prisma: PrismaClient,
      id: string,
      dataToUpdate: any,
) => {
      const channel = await prisma.channel.update({
            where: { userId: id },
            data: { ...dataToUpdate },
      });
      return channel;
};

export default {
      getMyChannelById,
      getChannelByHandle,
      getVideosByHandle,
      updateMyChannel,
};
