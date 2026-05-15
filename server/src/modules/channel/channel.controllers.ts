import type { FastifyRequest, FastifyReply } from "fastify";
import z, { parse } from "zod";
import channelSevices from "./channel.services";
import { AppError } from "../../utils/errors/app-error";
import { validateSchema } from "../../utils/zod-validate";

// writing here for now will export all the schema later to diff files...
// Define param/body shapes here
const handleSchema = z.object({
      handle: z.string().toLowerCase(),
});

const updateChannelSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      link: z.array(z.string()).optional(),
});

const getMyChannel = async (req: FastifyRequest, res: FastifyReply) => {
      //   console.log("Hello colt");
      //   get user from req.user
      const channel = await channelSevices.getMyChannelById(
            req.server.prisma,
            req.user.id,
      );
      //    fetch users by handle w/ serice getChannelByHandle for req.user
      return channel;
};

const getChannelByHandle = async (
      req: FastifyRequest<{ Params: { handle: string } }>,
      res: FastifyReply,
) => {
      const { handle } = validateSchema(handleSchema, req.params);
      const channel = await channelSevices.getChannelByHandle(
            req.server.prisma,
            handle,
      );
      return channel;
};

const getChannelVideos = async (
      req: FastifyRequest<{ Params: { handle: string } }>,
      res: FastifyReply,
) => {
      const { handle } = validateSchema(handleSchema, req.params);
      const videos = await channelSevices.getChannelByHandle(
            req.server.prisma,
            handle,
      );
      return videos;
};

const updateChannelDetails = async (req: FastifyRequest, res: FastifyReply) => {
      const dataToUpdate = validateSchema(updateChannelSchema, req.body);

      const videos = await channelSevices.updateMyChannel(
            req.server.prisma,
            req.user.id,
            dataToUpdate,
      );
      return videos;
};

export {
      getMyChannel,
      getChannelByHandle,
      getChannelVideos,
      updateChannelDetails,
};
