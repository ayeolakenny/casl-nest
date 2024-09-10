import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // await prisma.user.create({
  //   data: {
  //     email: 'admin@gmail.com',
  //     auth: {
  //       create: {
  //         passHash: await hash('password'),
  //       },
  //     },
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     email: 'user@gmail.com',
  //     auth: {
  //       create: {
  //         passHash: await hash('password'),
  //       },
  //     },
  //   },
  // });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
