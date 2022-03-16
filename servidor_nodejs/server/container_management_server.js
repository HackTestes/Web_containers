#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url'); // https://stackoverflow.com/questions/15317902/node-js-automatic-selection-of-http-get-vs-https-get
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');

const ExecFileAsync = util.promisify(child_process.execFile);

// https://stackoverflow.com/questions/58642368/how-to-download-a-file-with-nodejs

// https://developer.ibm.com/articles/avoiding-arbitrary-code-execution-vulnerabilities-when-using-nodejs-child-process-apis/

// Security settings
let security_settings = 
{
    safe_characters : /^[a-zA-Z0-9-_]*$/,
    search_characters : /^[a-zA-Z0-9-_\*]*$/
};

const app = express();
app.use(cors());
app.use(express.json());

// Cache de teste
//let file = fs.readFileSync("./?????");

//ExecFileAsync('chromium', ['--incognito', '--new-window', '--app=https://www.google.com']);

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

app.get('/TestAppDownload.zip', async (rew, res) =>
{
    let my_test_app = await fs.promises.readFile('/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/apps/Test_app/Test_app.zip');

    res.send(my_test_app);
});


// Registra o aplicativo
app.post('/RegisterApp', async (req, res) =>
{
    let protocol =
    {
        'http': http,
        'https': https
    }

    // !todo! Add try catch

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

    await fs.promises.mkdir(`./apps/${app_name}/bin`, (err) => {if (err) {throw err }});

    await fs.promises.writeFile(`./apps/${app_name}/${app_name}.json`, JSON.stringify(req.body), (err) => { if (err) throw err; });

    await protocol[req.body.app.origin_url.split(':')[0]].get(req.body.app.origin_url, resp => resp.pipe( fs.createWriteStream(`./apps/${app_name}/${ req.body.app.origin_url.split('/').pop() }`) ));

    res.json
    ({
        Status: "OK",
        Req: req.body
    });

    console.log( req.body, app_name, req.body.app.origin_url.split('/').pop() );
});


// Executa um aplicativo
app.post('/Execute/', async (req, res) =>
{
    // Input validation
    //console.log(`${req.body.app_name} : ${security_settings.safe_characters.test(req.body.app_name)}`);
    if( security_settings.safe_characters.test(req.body.app_name) )
    {
        try
        {
            let files = await fs.promises.readdir(`./apps/${req.body.app_name}/bin`);
            //console.log(files.length);

            if(files.length == 0)
            {
                // all file are build in the tmpfs folder and only the binary is stored on the host
                // tmpfs limit to avoid zip bombs
                await ExecFileAsync('podman', ['run', '--rm', '--tmpfs', '/container/tmpfs:rw,size=1048576k', '-v', `./apps/${req.body.app_name}/:/container/tmpfs/app`, '-v', `./apps/${req.body.app_name}/bin:/container/bin`, 'compilation_container']);
                //console.log(stdout);
            }

            // Execution
            let { stdout, stderr } = await ExecFileAsync('podman', ['run', '--rm', '--read-only', '-v', `./apps/${req.body.app_name}/bin:/app_container/:ro`, 'app_container']);

            res.json
            ({
                Status: 'OK',
                Stdout : stdout,
                Request_body: req.body
            });
        }

        catch(error)
        {
            if(error.code == 125 | error.code == 'ENOENT')
            {
                res.json
                ({
                    Status: 'ERROR',
                    Error_code: error.code.toString(),
                    Description: 'No such app'
                });
            }
            else
            {
                throw error;
            }
        }
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: error.toString()
        });
    }
});


// Seleciona uma tabela e mostra todo o conteúdo
app.get('/GetApps/:pattern', async (req, res) =>
{
    if( security_settings.search_characters.test(req.params.pattern) )
    {
        try
        {
            let files = await fs.promises.readdir("./apps/");
            let serach_result;

            if(req.params.pattern == '*')
            {
                serach_result = files
            }
            else
            {
                let search_pattern = new RegExp(`${req.params.pattern}`);
                serach_result = files.filter( (array_item) => { if(search_pattern.test(array_item)) {return array_item} } );
            }

            res.json
            ({
                Status: 'OK',
                Serach_Result : serach_result,
                All_apps : files,
                Search_pattern : req.params.pattern
            });
        }

        catch(error)
        {
            res.json
            ({
                Status: 'ERROR',
                Description: error.toString(),
                Search_pattern : req.params.pattern
            });
        }
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: 'Invalid input',
            Search_pattern : req.params.pattern
        });
    }
});

/*
// Insere uma configuração - POSSIVELMENTE NÃO TERÁ NO FINAL (FORO DO ESCOPO?)
app.post('/InsertConfig', (req, res) =>
{

});


// Atualiza uma entrada com um novo valor. Deve ser especificado uma tabela e uma coluna - PODE SER FEITO DIRETAMENTE NO RegisterApp
app.patch('/UpdateEntry', (req, res) =>
{

});
*/

app.delete('/Delete', (req, res) =>
{
    // Input validation
    //console.log(`${req.body.app_name} : ${security_settings.safe_characters.test(req.body.app_name)}`);
    if( security_settings.safe_characters.test(req.body.app_name) )
    {
        try
        {
            //await fs.promises.rmdir(`./apps/${req.body.app_name}`);
        }

        catch(error)
        {
            if(error.code == 'ENOENT')
            {
                res.json
                ({
                    Status: 'ERROR',
                    Error_code: error.code.toString(),
                    Description: 'No such app'
                });
            }
            else
            {
                throw error;
            }
        }
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: error.toString()
        });
    }
});


port_listen = 3000;
app.listen(port_listen, () => { console.log(`Server: OK \nPort: ${port_listen} \n`) })