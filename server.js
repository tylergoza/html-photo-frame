'use strict'

const http = require('http')
const formidable = require('formidable')
const fse = require('fs-extra')
const path = require('path')

let form = undefined
let upload_form = fse.readFileSync(path.join(__dirname, './upload.html'))

http.createServer((req, res) => {
    if (req.url === '/fileupload') {
        form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            let oldPath = files.filetoupload.path
            let newPath = path.join(__dirname, `./images/${fields.filename ? fields.filename + '.' + files.filetoupload.name.split('.')[1] : files.filetoupload.name}`)
            
            fse.rename(oldPath, newPath)
            .then(_ => {
                return fse.readJson(path.join(__dirname, './config.json'))
            })
            .then( config => {
                config.images = []
                fse.readdir(path.join(__dirname, './images')).then(files => {
                    files.forEach(file => {
                        config.images.push(`./images/${file}`)
                    })
                    return fse.writeJson(path.join(__dirname, './config.json'), config)
                })
            })
            .then(_ => {
                res.writeHead(301, {'Location': '/?successmessage=File%20uploaded%20and%20moved'})
                res.end()
            })
            .catch(err => {
                throw err
            })
        })
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(upload_form)
        return res.end()    
    }
    
}).listen(8080)