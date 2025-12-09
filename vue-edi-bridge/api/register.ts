import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI
if (!uri) return new Response('Missing MONGODB_URI', { status: 500 })

const client = new MongoClient(uri)

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { email, password } = await req.json()

  if (!email || !password || password.length < 6) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
  }

  try {
    await client.connect()
    const db = client.db('edi_bridge')
    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      return new Response(JSON.stringify({ error: 'User exists' }), { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await db.collection('users').insertOne({
      email,
      password: hashed,
      createdAt: new Date()
    })

    return new Response(JSON.stringify({ message: 'Created!' }), { status: 201 })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  } finally {
    await client.close()
  }
}