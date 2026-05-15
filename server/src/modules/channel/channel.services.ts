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

// const getVideosByHandle = async (prisma: PrismaClient, handle: string) => {
//       const handle = parse(z.string().lowercase(), inputHandle);

//       const videos = getVideosByHandle(prisma, inputHandle);
//       if (!channel) throw new AppError("NOT_FOUND", "Channel not found!");
//       return channel;
// };

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
      updateMyChannel,
};
