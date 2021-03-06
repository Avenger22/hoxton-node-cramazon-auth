// #region 'Importing and configuration of Prisma'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const app = express()
app.use(cors())
app.use(express.json())
// #endregion


// #region 'Helper functions'
function createToken (id: number) {
  // @ts-ignore
  return jwt.sign({ id: id }, process.env.MY_SECRET, { expiresIn: '5h' })
}

async function getUserFromToken (token: string) {
  
  // @ts-ignore
  const decodedData = jwt.verify(token, process.env.MY_SECRET)
  
  // @ts-ignore
  const user = await prisma.user.findUnique({ where: { id: decodedData.id }, include: { orders: { include: { item: true } } }})
  return user

}
// #endregion


// #region 'Auth End Points'
app.post('/login', async (req, res) => {

  const { email, password } = req.body

  try {

    const user = await prisma.user.findUnique({ where: { email: email }, include: { orders: { include: {item: true} } } })
    
    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password)

    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) })
    } 
    
    else {
      throw Error('ERROR')
    }

  } 
  
  catch (err) {
    res.status(400).send({ error: 'User/password invalid.' })
  }

})

app.get('/validate', async (req, res) => {

  const token = req.headers.authorization || ''

  try {
    // @ts-ignore
    const user = await getUserFromToken(token)
    res.send(user)
  } 
  
  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }

})
// #endregion


// #region "REST API end points"

// #region 'users endpoints'
app.get('/users', async (req, res) => {

  try {

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        orders: { 
          include: { item: true } 
        } 
      }
    })

    res.send(users)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<pre>${error.message}</pre>`)
  }

})

app.get('/users/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    const user = await prisma.user.findFirst({
      where: { id: idParam },
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        orders: { 
          include: { item: true } 
        }
      }
    })

    if (user) {
      res.send(user)
    } 
    
    else {
      res.status(404).send({ error: 'User not found.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/users', async (req, res) => {
    
  const { email, fullName, password, userName } = req.body
  
  try {

    // generate a hash also salts the password with 8 symbols from their password
    const hashedPassword = bcrypt.hashSync(password, 8)

    const newUser = {
      email: email, 
      fullName: fullName,
      password: hashedPassword
    }

    const userCheck = await prisma.user.findFirst({ where: { email: newUser.email } })
    
    if (userCheck) {
      res.status(404).send({ error: 'User has an already registered email try different email.' })
    }

    else {

      try {
        const createdUser = await prisma.user.create({data: newUser})
        res.send({ createdUser, token: createToken(createdUser.id) } )
      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/users/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id

  try {

    // check that they are signed in
    const user = await getUserFromToken(token)

    if (user) {

      await prisma.user.delete({ 
        where: { id: Number(idParam) }
      })

      res.send(user)

    }

    else {
      res.status(404).send({ error: 'user not found.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/users/:id', async (req, res) => {

  const idParam = req.params.id;
  const { email, fullName, password } = req.body

  const hashedPassword = bcrypt.hashSync(password, 8)

  const userData = {
    email: email,
    fullName: fullName,
    password: hashedPassword
  }

  try {

    const user = await prisma.user.update({
      where: {
        id: Number(idParam),
      },
      data: userData
    })

    res.send(user)

  } 
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region 'orders endpoints'
app.get('/orders', async (req, res) => {

  try {
    const orders = await prisma.order.findMany( { include : {user: true, item: true} } )
    res.send(orders)
  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/orders/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    const order = await prisma.order.findFirst({
      where: { id: idParam },
      include : {user: true, item: true}
    })

    if (order) {
      res.send(order)
    } 
    
    else {
      res.status(404).send({ error: 'order not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/orders', async (req, res) => {
    
  const token = req.headers.authorization || ''
  const { quantity, userId, itemId } = req.body
  
  const newOrder = {
    quantity: quantity,
    userId: userId,
    itemId: itemId
  }

  try {

    const user = await getUserFromToken(token)
    const orderCheck = await prisma.order.findFirst({ where: { userId: newOrder.userId, itemId: newOrder.itemId } })
    
    if (orderCheck) {
      res.status(404).send({ error: 'order has an already registered id combination try different combination.' })
    }

    else {

      try {
        const createdOrder = await prisma.order.create({data: newOrder})
        res.send(createdOrder)
      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/orders/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id

  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const order = await prisma.order.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const orderUserCheck = order.userId === user.id

    if (user && orderUserCheck) {

      const orderDeleted = await prisma.order.delete({ 
        where: { id: Number(idParam) }
      })

      const orders = await prisma.order.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(orders)

    }

    else {
      res.status(404).send({ error: 'order not found, or the order doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/orders/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id)
  const { quantity, userId, itemId } = req.body

  const orderData = {
    quantity: quantity,
    userId: userId,
    itemId: itemId
  }

  try {

    const user = await getUserFromToken(token)
    
    const orderMatch = await prisma.order.findFirst( { where: {id: idParam} } )
    //@ts-ignore
    const belongsToUser = orderMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const order = await prisma.order.update({
          where: {
            id: user.id,
          },
          data: orderData
        })

        res.send(order)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  } 
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "items endpoints"
app.get('/items', async (req, res) => {

  try {

    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        stock: true,
        type: true,
        description: true,
        orders: { 
          include: { user: true } 
        }
      }
    })

    res.send(items)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/items/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    const item = await prisma.item.findFirst({
      where: { id: idParam },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        stock: true,
        type: true,
        description: true,
        orders: { 
          include: { user: true } 
        }
      }
    })

    if (item) {
      res.send(item)
    } 
    
    else {
      res.status(404).send({ error: 'item not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/items', async (req, res) => {
    
  const token = req.headers.authorization || ''
  const { name, price, image, stock, type, description } = req.body
  
  const newItem = {
    name:  name,
    price: price, 
    image: image,
    stock: stock,
    type: type,
    description: description
  }

  try {

    const user = await getUserFromToken(token)
    const itemCheck = await prisma.item.findFirst({ where: { name: newItem.name } })
    
    if (itemCheck) {
      res.status(404).send({ error: 'item has an already registered name try different name.' })
    }

    else {

      try {
        const createdItem = await prisma.item.create({data: newItem})
        res.send(createdItem)
      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/items/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)

    const itemOrder = await prisma.order.findUnique({
      where: {
        //@ts-ignore
        itemId: Number(idParam)
      }
    })

    const itemBelongsToUser = itemOrder?.userId === user?.id
      
    // const item = await prisma.item.findFirst({
    //   where: {
    //     id: Number(idParam)
    //   }
    // })

    if (itemBelongsToUser && user) {

      const itemDeleted = await prisma.item.delete({ 
        where: { id: Number(idParam) }
      })

      res.send(itemDeleted)

    }

    else {
      res.status(404).send({ error: 'item not found or doesnt belong to that user.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/items/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id;
  const { name, price, image, stock, type, description } = req.body
  
  const itemData = {
    name:  name,
    price: price, 
    image: image,
    stock: stock,
    type: type,
    description: description
  }

  try {

    const user = await getUserFromToken(token)

    if (user) {

      try {

        const item = await prisma.item.update({
          where: {
            id: Number(idParam),
          },
          data: itemData
        })

        res.send(item)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error("Boom")
    }

  } 
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #endregion


app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})