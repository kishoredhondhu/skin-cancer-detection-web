const express = require('express')
const path = require('path')
const port = process.env.PORT || 3000

const app = express()

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')))

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})