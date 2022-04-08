#!/usr/bin/node --unhandled-rejections=strict

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url'); // https://stackoverflow.com/questions/15317902/node-js-automatic-selection-of-http-get-vs-https-get
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');
const crypto = require('crypto');

const ExecFileAsync = util.promisify(child_process.execFile);
const ExecAsync = util.promisify(child_process.exec);
const SpawnAsync = util.promisify(child_process.spawn);

// https://stackoverflow.com/questions/58642368/how-to-download-a-file-with-nodejs

// https://developer.ibm.com/articles/avoiding-arbitrary-code-execution-vulnerabilities-when-using-nodejs-child-process-apis/

console.log("Working dir: " + process.cwd());

// Security settings
let security_settings = 
{
    safe_characters : /^[a-zA-Z0-9-_]*$/,
    search_characters : /^[a-zA-Z0-9-_\*]*$/,
    admin_token: crypto.randomBytes(48).toString('hex')
};

let app_key = {};
let allowed_apps = {};

// ----------------------------------------------------------------------------------------------------------

// https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl
// Shell: openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
//let privateKey  = fs.readFileSync('key.pem', 'utf8');
//let certificate = fs.readFileSync('cert.pem', 'utf8');
//let credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(cors());
app.use(express.json());

// Cache de teste
//let file = fs.readFileSync("./?????");

app.get(`/Admin/${security_settings.admin_token}/`, (req, res) =>
{
    res.sendFile( __dirname + '/website/Projeto_2_site.html' );
});

app.get(`/Admin/${security_settings.admin_token}/:website_resource`, (req, res) =>
{
    res.sendFile( __dirname + `/website/${req.params.website_resource}` );
});


app.post('/TestAPI', (req, res) =>
{
    if(app_key[req.body.app_name] == req.body.app_key)
    {
        res.json
        ({
            Status: "OK"
            //Req: req
        });

       // console.log(req, "\n\n", req.ip);
    }
    else
    {
        res.json
        ({
            Status: "Invalid key",
            Key_recived: req.body.app_key
            //Req: req
        });

        console.log(req.body.app_key);
        console.log(app_key);
        console.log(app_key[req.body.app_name] == req.body.app_key);
    }
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
    let app_name;

    try
    {
        app_name = req.body.app.name;
        app_name = app_name.replace(/\/|\\| /g, '_');

        app_key[app_name] = crypto.randomBytes(48).toString('hex');

        await fs.promises.mkdir(`./apps/${app_name}`);
    }
    catch(error)
    {
        if(error.code == 'EEXIST')
        {
            console.log("App already exists");
        }
        else
        {
            throw error;
        }
    }

        // app_source is a mount point for tmpfs
        try{await fs.promises.mkdir(`./apps/${app_name}/app_source`);} catch(error) {if(error.code == 'EEXIST'){console.log("App source already exists" + error);}};

        try{await fs.promises.mkdir(`./apps/${app_name}/bin`);} catch(error) {if(error.code == 'EEXIST'){console.log("Bin already exists" + error);}};

        await fs.promises.writeFile(`./apps/${app_name}/${app_name}.json`, JSON.stringify(req.body)/*, (err) => { if (err) throw err; }*/);

        await protocol[req.body.app.origin_url.split(':')[0]].get(req.body.app.origin_url, resp => resp.pipe( fs.createWriteStream(`./apps/${app_name}/${ req.body.app.origin_url.split('/').pop() }`) ));

    res.json
    ({
        Status: "OK",
        Req: req.body,
        App_key: app_key[app_name]
    });

    console.log( req.body, app_name, req.body.app.origin_url.split('/').pop() );
});

// ExecFileAsync('podman', ['run', '--rm', '--tmpfs', '/container/tmpfs:rw,size=1048576k', '-v', `./apps/${req.body.app_name}/:/container/tmpfs/app`, '-v', `./apps/${req.body.app_name}/bin:/container/bin`, 'compilation_container']);
// ExecFileAsync('podman', ['run', '--rm', '--read-only', '-v', `./apps/${req.body.app_name}/bin:/app_container/:ro`, 'app_container']);

let seccomp_exe = "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp";
let seccomp_allowed_syscalls = "execve,brk,arch_prctl,access,openat,newfstatat,mmap,close,read,pread64,mprotect,set_tid_address,set_robust_list,prlimit64,munmap,getrandom,write,exit_group,exit,fstat,readlink,uname,access";
let apparmor_profile = '/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/apps/**';

// Executa um aplicativo
app.post('/Execute/', async (req, res) =>
{
    // Input validation
    //console.log(`${req.body.app_name} : ${security_settings.safe_characters.test(req.body.app_name)}`);
    if( security_settings.safe_characters.test(req.body.app_name) && app_key[req.body.app_name] == req.body.app_key )
    {
        try
        {
            let files = await fs.promises.readdir(`./apps/${req.body.app_name}/bin`);
            //console.log(files.length);

            if(files.length == 0)
            {
                // all file are build in the tmpfs folder and only the binary is stored on the host
                // tmpfs limit to avoid zip bombs
                //await ExecFileAsync('podman', ['run', '--rm', '--tmpfs', '/container/tmpfs:rw,size=1048576k', '-v', `./apps/${req.body.app_name}/:/container/tmpfs/app`, '-v', `./apps/${req.body.app_name}/bin:/container/bin`, 'compilation_container']);
                await ExecFileAsync(`${seccomp_exe}`, [`--unshare`, `all-pid`, `--fork`, `--uid`, `1000`,`--gid`, `1000`, `--apparmor-profile-immediate`, `compilation_security_profile`, `--mount`, `tmpfs_device`, `/tmp`, `tmpfs`, 'MS_NODEV|MS_NOEXEC|MS_NOSUID', 'size=1G', `--mount`, `tmpfs_device_src`, `${__dirname}/apps/${req.body.app_name}/app_source`, `tmpfs`, 'MS_NODEV|MS_NOEXEC|MS_NOSUID', 'size=1G', `--no-seccomp`, `/media/caioh/EXTERNAL_HDD1/TCC_CAIO/conteiner_compilacao/build_executable.sh`, `${__dirname}/apps/${req.body.app_name}` ]);
                //console.log(stdout);
            }

            let app_to_execute = `${__dirname}/apps/${req.body.app_name}/bin/AppExecutable`;


            // Execution
            let { stdout, stderr } = await ExecFileAsync(`${seccomp_exe}`, [`--unshare`, `all`, `--fork`, `--uid`, `1000`,`--gid`, `1000`, '--no-seccomp', `--seccomp-syscalls`, `${seccomp_allowed_syscalls}`, `--pivot-root`, `${__dirname}/apps/${req.body.app_name}/bin`, `/AppExecutable`]);

            res.json
            ({
                Status: 'OK',
                Stdout : stdout,
                Stderr: stderr,
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
            Description: "Invalid key or app or invalid chracters"
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

//let httpsServer = https.createServer(credentials, app);

port_listen = 3000;
app.listen(port_listen, () =>
{
    console.log(`Server: OK \nPort: ${port_listen} \n`);
    console.log(`http://127.0.0.1:${port_listen}/Admin/${security_settings.admin_token}/\n`);

    ExecFileAsync('chromium', ['--incognito', `http://127.0.0.1:${port_listen}/Admin/${security_settings.admin_token}/`]);
});