import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const users = [
  {
    id: 1,
    email: 'person1@email.com',
    name: 'Person1'
  },
  {
    id: 2,
    email: 'person2@email.com',
    name: 'Person2'
  },
  {
    id: 3,
    email: 'person3@email.com',
    name: 'Person3'
  }
]

const orders = [
  {
    id: 1,
    quantity: 14,
    dateCreated: "2020-03-19T14:21:00+02:00",
    paymentMethod: "cash on delivery",
    userId: 1,
    itemId: 2
  },
  {
    id: 2,
    quantity: 3,
    dateCreated: "2022-01-12T14:21:00+02:00",
    paymentMethod: "cash on delivery",
    userId: 1,
    itemId: 3
  },
  {
    id: 3,
    quantity: 23,
    dateCreated: "2017-01-19T14:21:00+02:00",
    paymentMethod: "online paypal",
    userId: 3,
    itemId: 1
  },
  {
    id: 4,
    quantity: 3,
    dateCreated: "2021-03-19T14:21:00+02:00",
    paymentMethod: "cash on delivery",
    userId: 3,
    itemId: 2
  },
  {
    id: 5,
    quantity: 1,
    dateCreated: "2010-03-19T14:21:00+02:00",
    paymentMethod: "pnline paypal",
    userId: 2,
    itemId: 2
  },
  {
    id: 6,
    quantity: 36,
    dateCreated: "2021-08-19T14:21:00+02:00",
    paymentMethod: "cash on delivery",
    userId: 2,
    itemId: 3
  }
]

const items = [
  {
    id: 1,
    title: 'item1',
    price: 15.67,
    image: "item1.jpg"
  },
  {
    id: 2,
    title: 'item2',
    price: 27.67,
    image: "item2.jpg"
  },
  {
    id: 3,
    title: 'item3',
    price: 15.00,
    image: "item3.jpg"
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