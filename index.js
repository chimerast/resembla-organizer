const { spawn, spawnSync } = require('child_process')
const { mkdirSync, writeFileSync } = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const config = require('./config.json')

/*
 * initialize
 */
process.on('SIGINT', () => process.exit())
spawnSync('mkdir', ['-p', '/data'])

app.use(bodyParser.text({ type: '*/*' }))
app.listen(process.env.PORT || 3000)


/*
 * express
 */
app.get('/config', (req, res) => {
  res.json(config)
})

app.post('/reindex', (req, res) => {
  const result = reindex(req.body)
  restart()

  res.set('Content-Type', 'text/plain').send(result.stderr.toString())
})


/*
 * resembla
 */
let id = '00000000'
let proc = null

const rootdir = () => `/data/${id}`
const json = () => `${rootdir()}/config.json`
const tsv = () => `${rootdir()}/corpus.tsv`

const reindex = (corpus) => {
  id = Math.random().toString(36).slice(-8)

  config.common.corpus_path = tsv()

  mkdirSync(rootdir())

  writeFileSync(json(), JSON.stringify(config))
  writeFileSync(tsv(), corpus)

  return spawnSync('resembla_index', ['-c', json()])
}

const restart = () => {
  const start = () => spawn('resembla_server', ['-c', json()], { stdio: 'ignore' })
  if (proc) {
    proc.on('exit', (code, signal) => {
      proc = start()
    })
    proc.kill()
  } else {
    proc = start()
  }
}
