import fp from "fastify-plugin";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { AppError } from "../utils/errors/app-error";

if(!process.env.DATABASE_URL) throw new AppError("NOT_FOUND", "DB not connnected")
const connectionString = `${process.env.DATABASE_URL}`;

// this plugin will create a prisma client instance and connect to the database when the server starts and disconnect when the server stops. We will use this plugin in our routes and controllers to access the database.
const prismaPlugin = fp(async (app) => {

    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({adapter});

    await prisma.$connect();

    app.decorate("prisma", prisma);
    // decorate the app with the prisma client instance meaning that we can access it in our routes and controllers using app.prisma / request.server.prisma 

    app.addHook("onClose", async () => {
        await prisma.$disconnect();
    });
});

// `fastify-plugin` disables unwanted encapsulation here, because DB should be global.
export default prismaPlugin;


