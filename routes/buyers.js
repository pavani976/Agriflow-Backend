import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Ravi Traders',
      location: 'Tirupati',
      phone: '9876543210',
      crops: ['Rice', 'Tomato'],
      rating: 4.6,
      demand: 'High',
      verified: true,
      orders: 120,
      trustScore: 92,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Lakshmi Agro Buyers',
      location: 'Chittoor',
      phone: '9123456780',
      crops: ['Groundnut', 'Chilli'],
      rating: 4.4,
      demand: 'Medium',
      verified: true,
      orders: 86,
      trustScore: 88,
      updatedAt: new Date().toISOString(),
    },
  ])
})

export default router