import * as bcrypt from 'bcrypt';
import { Exhibit, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!';

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin user: ${email}`);

  const visitors = await Promise.all(
    [
      { name: 'Анна Смирнова', email: 'anna@museum.demo' },
      { name: 'John Smith', email: 'john@museum.demo' },
      { name: 'Мария Коваль', email: 'maria@museum.demo' },
    ].map((v) =>
      prisma.visitor.upsert({
        where: { email: v.email },
        update: { name: v.name },
        create: v,
      }),
    ),
  );

  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Технологии будущего', description: 'Основная экспозиция' },
    });
  }

  const exhibitTitles = [
    { title: 'Квантовый компьютер', description: 'Вычисления будущего' },
    { title: 'Космический лифт', description: 'Транспорт в космос' },
  ];

  const exhibits: Exhibit[] = [];
  for (const e of exhibitTitles) {
    const found = await prisma.exhibit.findFirst({ where: { title: e.title } });
    exhibits.push(
      found ??
        (await prisma.exhibit.create({
          data: { ...e, categoryId: category.id },
        })),
    );
  }

  const reviewsData = [
    {
      rating: 5,
      text: 'Потрясающая экспозиция! Квантовый блок наглядно объясняет сложные идеи.',
      visitorId: visitors[0].id,
      exhibitId: exhibits[0].id,
    },
    {
      rating: 4,
      text: 'Great museum! The space elevator concept blew my mind.',
      visitorId: visitors[1].id,
      exhibitId: exhibits[1]?.id ?? exhibits[0].id,
    },
    {
      rating: 5,
      text: 'Виртуальный музей получился современным и удобным. Вернусь с друзьями.',
      visitorId: visitors[2].id,
      exhibitId: exhibits[1]?.id ?? exhibits[0].id,
    },
  ];

  for (const r of reviewsData) {
    const exists = await prisma.review.findFirst({
      where: {
        visitorId: r.visitorId,
        exhibitId: r.exhibitId,
        text: r.text,
      },
    });
    if (!exists) {
      await prisma.review.create({ data: r });
    }
  }

  const count = await prisma.review.count();
  console.log(`Visitors: ${visitors.length}, reviews in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
