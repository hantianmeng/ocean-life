const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化测试数据...');

  // 清除现有数据
  await prisma.comment.deleteMany();
  await prisma.image.deleteMany();
  await prisma.species.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('现有数据已清除');

  // 创建用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: '普通用户',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('用户创建成功');

  // 创建分类
  const fishCategory = await prisma.category.create({
    data: {
      name: '鱼类',
      description: '鱼类是脊椎动物中数量最多的一类，全世界现存约有32,000多种。',
      imageUrl: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2',
    },
  });

  const mammalCategory = await prisma.category.create({
    data: {
      name: '海洋哺乳类',
      description: '海洋哺乳动物是生活在海洋生态系统中的哺乳动物，包括鲸类、海豚、海豹等。',
      imageUrl: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f',
    },
  });

  const molluscCategory = await prisma.category.create({
    data: {
      name: '软体动物',
      description: '软体动物门是动物界中种类仅次于节肢动物门的第二大门，包括贝类、章鱼、乌贼等。',
      imageUrl: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10',
    },
  });

  const crustaceanCategory = await prisma.category.create({
    data: {
      name: '甲壳类',
      description: '甲壳类是节肢动物门中的一个亚门，包括螃蟹、虾、龙虾等。',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
    },
  });

  console.log('分类创建成功');

  // 创建物种
  const blueWhale = await prisma.species.create({
    data: {
      name: '蓝鲸',
      scientificName: 'Balaenoptera musculus',
      foreignName: 'Blue Whale',
      protectionLevel: '国家一级保护动物',
      description: '蓝鲸是地球上已知最大的动物，可长达30米，重达173吨。',
      habitat: '主要生活在南极洲水域、北大西洋和北太平洋',
      distribution: '全球海洋，主要在极地水域',
      altitude: '海平面至深海',
      habits: '蓝鲸是独居动物，偶尔也会成对或小群出现。它们白天潜入深海，夜晚上升到表层。',
      reproduction: '蓝鲸每2-3年生产一胎，怀孕期约11-12个月，幼鲸出生后由母鲸哺乳6-7个月。',
      isEdible: false,
      isFeatured: true,
      categoryId: mammalCategory.id,
    },
  });

  const blueWhaleImage1 = await prisma.image.create({
    data: {
      url: 'https://images.unsplash.com/photo-1601514714674-a22d8d62339d',
      caption: '蓝鲸在海面游弋',
      speciesId: blueWhale.id,
    },
  });

  const blueWhaleImage2 = await prisma.image.create({
    data: {
      url: 'https://images.unsplash.com/photo-1548925081-d5d9ca996d9f',
      caption: '蓝鲸潜水瞬间',
      speciesId: blueWhale.id,
    },
  });

  const greatWhiteShark = await prisma.species.create({
    data: {
      name: '大白鲨',
      scientificName: 'Carcharodon carcharias',
      foreignName: 'Great White Shark',
      protectionLevel: '濒危物种',
      description: '大白鲨是世界上最大的掠食性鱼类之一，体长可达6米，体重约2吨。',
      habitat: '沿海海域和开阔海洋',
      distribution: '几乎遍布全球温暖和温带海域',
      habits: '大白鲨是孤独的猎手，擅长偷袭和突袭猎物。它拥有敏锐的嗅觉，能够从很远的距离感知到猎物的气息。',
      reproduction: '卵胎生，幼鲨在母体内发育，一胎4-10条幼鲨。',
      isEdible: false,
      isFeatured: true,
      categoryId: fishCategory.id,
    },
  });

  const greatWhiteSharkImage = await prisma.image.create({
    data: {
      url: 'https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae',
      caption: '大白鲨露出水面',
      speciesId: greatWhiteShark.id,
    },
  });

  const octopus = await prisma.species.create({
    data: {
      name: '章鱼',
      scientificName: 'Octopus vulgaris',
      foreignName: 'Common Octopus',
      description: '章鱼是一种聪明的软体动物，有八条触手和高度发达的中枢神经系统。',
      habitat: '珊瑚礁、岩石海底和海草床',
      distribution: '热带和温带海域',
      habits: '章鱼是夜行性动物，白天躲在洞穴里，夜晚出来觅食。它们有很强的学习能力和解决问题的能力。',
      reproduction: '雌章鱼一次产卵约20万枚，孵化后雌章鱼死亡。',
      isEdible: true,
      cookingMethods: '可炖、炒、烤或生食。中国烹饪中常用红烧、清蒸等方式。',
      isFeatured: false,
      categoryId: molluscCategory.id,
    },
  });

  const octopusImage = await prisma.image.create({
    data: {
      url: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10',
      caption: '章鱼在海底游动',
      speciesId: octopus.id,
    },
  });

  const lobster = await prisma.species.create({
    data: {
      name: '龙虾',
      scientificName: 'Homarus americanus',
      foreignName: 'American Lobster',
      description: '龙虾是大型甲壳类动物，有两只大螯，体色通常为暗蓝色带黑色斑点，煮熟后变成亮红色。',
      habitat: '岩石海底和砂质海底',
      distribution: '大西洋沿岸',
      habits: '龙虾是夜行性动物，白天躲在岩石缝隙中，夜晚出来觅食。',
      reproduction: '雌龙虾一次可产3000-75000枚卵，孵化时间约9-12个月。',
      isEdible: true,
      cookingMethods: '常见的烹饪方法有水煮、蒸、烤和炖。龙虾肉质鲜美，常被视为海鲜中的美味佳肴。',
      isFeatured: true,
      categoryId: crustaceanCategory.id,
    },
  });

  const lobsterImage = await prisma.image.create({
    data: {
      url: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      caption: '活龙虾特写',
      speciesId: lobster.id,
    },
  });

  console.log('物种和图片创建成功');

  // 创建评论
  const comment1 = await prisma.comment.create({
    data: {
      content: '蓝鲸真是太壮观了！希望有一天能亲眼见到它们。',
      userId: user.id,
      speciesId: blueWhale.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: '大白鲨虽然看起来很凶猛，但它们对维持海洋生态平衡非常重要。',
      userId: admin.id,
      speciesId: greatWhiteShark.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      content: '章鱼的智力真的很高，它们能解决复杂的问题，甚至能使用工具！',
      userId: user.id,
      speciesId: octopus.id,
    },
  });

  console.log('评论创建成功');

  console.log('数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据初始化过程中出错:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });