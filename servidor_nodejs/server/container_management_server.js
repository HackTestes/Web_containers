#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https')
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');

const ExecFileAsync = util.promisify(child_process.execFile);

// https://stackoverflow.com/questions/58642368/how-to-download-a-file-with-nodejs

// https://developer.ibm.com/articles/avoiding-arbitrary-code-execution-vulnerabilities-when-using-nodejs-child-process-apis/

// Security settings
let security_settings = 
{
    safe_characters : /^[a-zA-Z0-9-_]*$/
};

const app = express();
app.use(cors());
app.use(express.json());

// Cache de teste
//let file = fs.readFileSync("./?????");

app.get('/TestAPI', (req, res) =>
{
    res.json
    ({
        Status: "OK"
        //Req: req
    });

    console.log( require('crypto').randomBytes(48).toString('hex') );

    console.log(req, "\n\n", req.ip);
});


// Registra o aplicativo
app.post('/RegisterApp', async (req, res) =>
{
    res.json
    ({
        Status: "OK",
        Req: req.body
    });

    let app_name = req.body.developer.name + '_' + req.body.app.name;
    app_name = app_name.replace(/\/|\\| /g, '_');

    await fs.mkdir(`./apps/${app_name}`, (err) =>
    {
        if (err)
        {
            if(err.code == 'EEXIST')
            {
                console.log("App already exists");
            }
            else {throw err;}
        }
    });

    await fs.writeFile(`./apps/${app_name}/${app_name}.json`, JSON.stringify(req.body), (err) => { if (err) throw err; });

    await https.get(req.body.app.origin_url, resp => resp.pipe( fs.createWriteStream(`./apps/${app_name}/${ req.body.app.origin_url.split('/').pop() }`) ));

    console.log( req.body, app_name, req.body.app.origin_url.split('/').pop() );
});


// Executa um aplicativo
app.post('/Execute/:app_name', async (req, res) =>
{
    // Input validation
    console.log(`${req.params.app_name} : ${security_settings.safe_characters.test(req.params.app_name)}`);
    if( security_settings.safe_characters.test(req.params.app_name) )
    {
        try
        {
            let files = await fs.promises.readdir("./apps/Test_app/bin");
            //console.log(files.length);

            if(files.length == 0)
            {
                // all file are build in the tmpfs folder and only the binary is stored on the host
                // tmpfs limit to avoid zip bombs
                let { stdout, stderr } = await ExecFileAsync('podman', ['run', '--rm', '--tmpfs', '/container/tmpfs:rw,size=1048576k', '-v', `./apps/Test_app/:/container/tmpfs/app`, '-v', `./apps/Test_app/bin:/container/bin`, 'compilation_container']);
                console.log(stdout);
            }

            // Execution
            let { stdout, stderr } = await ExecFileAsync('podman', ['run', '--rm', '--read-only', '-v', `./apps/Test_app/bin:/app_container/:ro`, 'app_container']);
            res.send(stdout);
        }

        catch(error)
        {
            if(error.code == 125 | error.code == 'ENOENT')
            {
                res.send("No such app\n");
            }
            else
            {
                throw error;
            }
        }
    }

    else
    {
        res.send("Invalid input\n");
    }
});

/*
// Seleciona uma tabela e mostra todo o conteúdo
app.get('/table/:table_name', (req, res) =>
{

});

// Pesquisa de acordo com a tabela, coluna e o valor especificado
app.get('/search/:table_name/:column_name/:column_value', (req, res) =>
{

});


// Insere uma configuração - POSSIVELMENTE NÃO TERÁ NO FINAL (FORO DO ESCOPO?)
app.post('/InsertConfig', (req, res) =>
{

});


// Atualiza uma entrada com um novo valor. Deve ser especificado uma tabela e uma coluna
app.patch('/UpdateEntry', (req, res) =>
{

});


app.delete('/DeleteEntry', (req, res) =>
{

});
*/

port_listen = 3000;
app.listen(port_listen, () => { console.log(`Server: OK \nPort: ${port_listen} \n`) })