// import

import type { FastifyInstance } from "fastify";
import {
      getMyChannel,
      getChannelByHandle,
      getChannelVideos,
      updateChannelDetails,
} from "./channel.controllers";

const channelRoutes = async function (app: FastifyInstance) {
      // GET /channels/me         → my own channel (authenticated)
      app.get("/me",{ preHandler: app.authenticate }, getMyChannel);

      // GET /channels/:handle    → any channel by handle (e.g. @fireship)
      app.get("/:handle", getChannelByHandle);

      // GET /channels/:handle/videos  → paginated videos of a channel
      app.get("/:handle/videos", getChannelVideos);

      // PUT /channels/me         → update MY channel only
      app.put("/me",{ preHandler: app.authenticate }, updateChannelDetails);
};

export default channelRoutes;
