import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const users = [
  {
    id: 1,
    email: 'jurgenhasmeta@email.com',
    fullName: 'Jurgen Hasmeta',
    password: bcrypt.hashSync("jurgen123", 8)
  },
  {
    id: 2,
    email: 'ryder@email.com',
    fullName: 'Ryder Ferrell',
    password: bcrypt.hashSync("ryder123", 8)
  },
  {
    id: 3,
    email: 'person3@email.com',
    fullName: 'Alvaro Wyatt',
    password: bcrypt.hashSync("alvaro123", 8)
  }
]

const orders = [
  {
    id: 1,
    quantity: 2,
    userId: 1,
    itemId: 2
  },
  {
    id: 2,
    quantity: 4,
    userId: 1,
    itemId: 3
  },
  {
    id: 3,
    quantity: 3,
    userId: 3,
    itemId: 1
  },
  {
    id: 4,
    quantity: 3,
    userId: 3,
    itemId: 2
  },
  {
    id: 5,
    quantity: 1,
    userId: 2,
    itemId: 2
  },
  {
    id: 6,
    quantity: 3,
    userId: 2,
    itemId: 3
  }
]

const items = [
  {
    id: 1,
    name: "Animal Pak Powder",
    price: 55,
    image: "/assets/images/animal-pak-powder.png",
    stock: 7,
    type: "multivitamins",
    description: "The True Original since 1983, Animal Pack was developed to meet the needs of the world's most extreme athletes as well as the most extreme training sessions. The Ultimate Training Package is much more than just a multivitamin, but it is the credible, courageous foundation on which the most dedicated weightlifters and extreme athletes have built their diets."
  },
  {
    id: 2,
    name: "Artichoke Premium",
    price: 10,
    image: "/assets/images/animal-pak-powder.png",
    stock: 5,
    type: "multivitamins",
    description: "Artichoke Premium is a supplement containing high quality artichoke extracts with 5% standardized cinnar content.Research has shown that the extract of artichoke leaves:Helps in detoxification"
  },
  {
    id: 3,
    name: "Argi Power 1500 Mega Caps",
    price: 30.5,
    image: "/assets/images/animal-pak-powder.png",
    stock: 5,
    type: "aminoacids",
    description: "Argi Power 1500 Mega Caps, mega capsules contain 1500 mg L-Arginine with the highest pharmaceutical quality in one capsule. How does L-Arginine HCl work and what is it used for? L-arginine is a dietary supplement that participates in many processes of formation of substances in the body: eg nitric oxide. Furthermore it provides the formamide group that serves in creatine biosynthesis."
  },
  {
    id: 4,
    name: "Beta-Alanine Xplode Powder",
    price: 28,
    image: "/assets/images/animal-pak-powder.png",
    stock: 5,
    type: "aminoacids",
    description: "Beta-Alanine Xplode Powder supplement is a preparation in the form of a powder with perfect solubility, which contains very high quality Beta-Alanine, enriched with vitamin B6 and L-Histidine."
  },
  {
    id: 5,
    name: "Dymatize Elite 100 % Whey",
    price: 65.35,
    image: "/assets/images/animal-pak-powder.png",
    stock: 15,
    type: "proteins",
    description: "The perfect whey protein anytime! Are you looking for a high value whey protein? Whether you seek to support muscle growth after an intense workout or simply seek to increase your daily protein intake."
  }
]

async function createStuff () {

  await prisma.order.deleteMany()
  await prisma.user.deleteMany()
  await prisma.item.deleteMany()

  for (const user of users) {
    await prisma.user.create({ data: user })
  }

  for (const item of items) {
    await prisma.item.create({ data: item })
  }

  for (const order of orders) {
    await prisma.order.create({ data: order })
  }

}

createStuff()