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

  try {
    await client.connect()
    const db = client.db('edi_bridge')
    const user = await db.collection('users').findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
    }

    return new Response(JSON.stringify({ user: { email } }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  } finally {
    await client.close()
  }
}