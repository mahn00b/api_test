import next from 'next'
import crypto from 'crypto'
import cookie_parser from 'cookie-parser'
import body_parser from 'body-parser'
import express from 'express'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {

  const server = express()

  server.use(cookie_parser())
  server.use(body_parser.json())

  server.get('/', (req: any, res: any) => {
      app.render(req, res, '/', req.query)
  })

  server.get('/register', (req: any, res: any) => {
      app.render(req, res, '/register', req.query)
  })

  server.get('/accounts', (req: any, res: any) => {
      app.render(req, res, '/accounts')
  })

  server.post('/login', (req: any, res: any) => {
    const { username, pass: password } = req.body
    const { username: user, pass } = req.cookies

    if (username !== user)
      return res.status(200).send({ error: 'failed user'})

    if (hash_pass(password) !== pass)
      return res.status(200).send({ error: 'failed pass' })

    res.cookie('loggedIn', true)

    return res.status(200).send({})
  })

  server.post('/newuser', (req: any, res: any) => {
      const { username, pass } = req.body
      res.cookie('username', username)
      res.cookie('pass', hash_pass(pass))
      res.cookie('loggedIn', true)
      app.render(req, res, '/accounts')
  })

  server.post('/logout', (req: any, res: any) => {
      res.clearCookie('loggedIn')
      return res.status(200).redirect('/')
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  function hash_pass(pass) {
    return crypto.createHmac('sha256', 'My secret')
      .update(pass)
      .digest('hex');
  }

  server.listen(port)

  // tslint:disable-next-line:no-console
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  )
})
