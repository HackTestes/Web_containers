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

// !todo! Validate json data type and schema

// https://stackoverflow.com/questions/58642368/how-to-download-a-file-with-nodejs

// https://developer.ibm.com/articles/avoiding-arbitrary-code-execution-vulnerabilities-when-using-nodejs-child-process-apis/

// This object stores persistent data about this program
let global_settings = fs.readFileSync('./settings.json')
global_settings = JSON.parse(global_settings);

console.log("Working dir: " + process.cwd());

// Stores app's names with specific permissions
// app_name = permissions_set
// Overview: Map( "app_name" = Set{install, execute, update} )
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Set
let security_permissions = new Map();
global_settings.security_permissions.forEach( (value) => { security_permissions.set(value[0], new Set(value[1])) } );

let permissions_requests = new Map();


// Security settings
let security_settings = 
{
    safe_characters : /^[a-zA-Z0-9-_]*$/,
    search_characters : /^[a-zA-Z0-9-_\*]*$/,
    admin_token: crypto.randomBytes(48).toString('hex')
};

// ----------------------------------------------------------------------------------------------------------

// https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl
// Shell: openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
//let privateKey  = fs.readFileSync('key.pem', 'utf8');
//let certificate = fs.readFileSync('cert.pem', 'utf8');
//let credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(cors());
app.use(express.json());


app.get('/TestAppDownload.zip', async (rew, res) =>
{
    let my_test_app = await fs.promises.readFile('/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/Test_app.zip');

    res.send(my_test_app);
});

app.get(`/Admin/${security_settings.admin_token}/`, (req, res) =>
{
    res.sendFile( __dirname + '/website/admin_web_interface.html' );
});

app.get(`/Admin/${security_settings.admin_token}/:website_resource`, (req, res) =>
{
    res.sendFile( __dirname + `/website/${req.params.website_resource}` );
});

// Just an idea against URL/network sniffing*
// Observation: this server is not encrypted!
/*
app.get(`/Admin/${security_settings.admin_token}/GetNonURLToken`, (req, res) =>
{
    res.send( crypto.randomBytes(48).toString('hex') );
});
*/

app.post('/Admin/PersistentSettings', async (req, res) =>
{
    if(req.body.admin.token == security_settings.admin_token)
    {
        for(key_value of req.body.settings)
        {
            //console.log(key_value[0], key_value[1]);
            //global_settings[key_value[0]] = global_settings[key_value[1]];
        }

        res.json
        ({
            Status: 'OK',
            Description: 'New settings added',
            Settings: global_settings
        })
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: 'Incorrect admin token',
            Token: req.body.admin.token
        });
    }
});

app.post('/Admin/PermissionPersistentSettings', async (req, res) =>
{
    // Verify credentials
    if(req.body.admin.token == security_settings.admin_token)
    {
        console.log(JSON.stringify(global_settings));

        if(req.body.admin.operation == 'reset_permissions' || false)
        {
            security_permissions = new Map();
            global_settings.security_permissions = [];
            await fs.promises.writeFile(`./settings.json`, JSON.stringify(global_settings));

            res.json
            ({
                Staus: 'OK',
                Description: 'JSON settings reseted and saved with success',
                Settings: JSON.stringify(global_settings)
            });
        }

        else if (req.body.admin.operation == 'save_current_permissions' || false)
        {
            global_settings.security_permissions = [];
            security_permissions.forEach( (value, key) => { global_settings.security_permissions.push([key, Array.from(value)]) } );

            await fs.promises.writeFile(`./settings.json`, JSON.stringify(global_settings));

            res.json
            ({
                Staus: 'OK',
                Description: 'JSON settings saved with success',
                Settings: JSON.stringify(global_settings)
            });
        }

        else
        {
            res.json
            ({
                Staus: 'ERROR',
                Description: 'Invalid operation'
            });
        }
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: 'Incorrect admin token',
            Token: req.body.admin.token
        });
    }
});

app.post('/Admin/RequestAppPermissions', async (req, res) =>
{
    // Verify credentials
    if(req.body.admin.token == security_settings.admin_token)
    {

        let permissions_requests_array = [];
        permissions_requests.forEach( (value, key) => { permissions_requests_array.push([key, Array.from(value)]) } )

        let security_permissions_array = [];
        security_permissions.forEach( (value, key) => { security_permissions_array.push([key, Array.from(value)]) } )

        //console.log(permissions_requests_array, security_permissions_array);

        res.json
        ({
            Status: 'OK',
            Permissions_requests: permissions_requests_array,
            Current_Permissions: security_permissions_array
        });
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: 'Incorrect admin token',
            Token: req.body.admin.token
        });
    }
});

app.post('/Admin/SetAppPermissions', async (req, res) =>
{
    // Verify credentials
    if(req.body.admin.token == security_settings.admin_token)
    {
        try
        {
            // Configure permissions - more or less permissions
            if(req.body.admin.security_operation == "permissions_add")
            {
                // If exists, just add
                if(security_permissions.has(req.body.app.name))
                {
                    req.body.app.permissions.forEach( (value) => {security_permissions.get(req.body.app.name).add(value)} );
                    permissions_requests.delete(req.body.app.name);
                }

                // If not, set the exact permissions
                else
                {
                    security_permissions.set(req.body.app.name, new Set(req.body.app.permissions));
                    permissions_requests.delete(req.body.app.name);
                }
            }

            else if(req.body.admin.security_operation == "deny_request")
            {
                permissions_requests.delete(req.body.app.name);
            }

            // Delete all permissions
            else if(req.body.admin.security_operation == "permissions_revoke_all")
            {
                security_permissions.delete(req.body.app.name);
            }

            else
            {
                res.json
                ({
                    Status: 'ERROR',
                    Description: 'Invalid security operation',
                    Req: req.body
                });

                return;
            }

            res.json
            ({
                Status: 'OK',
                Permission: security_permissions.get(req.body.app.name)
            });
        }

        catch(error)
        {
            res.json
            ({
                Status: 'ERROR',
                Description: 'Internal error',
                Log: error.toString()
            });
        }
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: 'Incorrect admin token'
        });
    }
});

app.post('/RequestAppPermissions', async (req, res) =>
{
    // Input validation
    if(security_settings.safe_characters.test(req.body.app.name))
    {
        // permissions must be an array
        permissions_requests.set(req.body.app.name, new Set(req.body.app.permissions))

        res.json
        ({
            Status: 'OK',
            Req: req.body
        })
    }

    else
    {
        res.json
        ({
            Status: 'ERROR',
            Description: "Unsafe characters"
        });
    }
});


// Register the app
app.post('/RegisterApp', async (req, res) =>
{
    //if(GetSecurityPermission(req.body.app.name, 'register'))
    if(security_permissions.has(req.body.app.name) && security_permissions.get(req.body.app.name).has('register'))
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

            await fs.promises.writeFile(`./apps/${app_name}/${app_name}.json`, JSON.stringify(req.body));

            await protocol[req.body.app.origin_url.split(':')[0]].get(req.body.app.origin_url, resp => resp.pipe( fs.createWriteStream(`./apps/${app_name}/${ req.body.app.origin_url.split('/').pop() }`) ));

        res.json
        ({
            Status: "OK",
            Req: req.body
        });

        console.log( req.body, app_name, req.body.app.origin_url.split('/').pop() );
    }

    else
    {
        res.json
        ({
            Status: "ERROR_SECURITY",
            Description: 'Permission to register denied. Request added',
            Req: req.body
        });
    }
});

// ExecFileAsync('podman', ['run', '--rm', '--tmpfs', '/container/tmpfs:rw,size=1048576k', '-v', `./apps/${req.body.app_name}/:/container/tmpfs/app`, '-v', `./apps/${req.body.app_name}/bin:/container/bin`, 'compilation_container']);
// ExecFileAsync('podman', ['run', '--rm', '--read-only', '-v', `./apps/${req.body.app_name}/bin:/app_container/:ro`, 'app_container']);

let seccomp_exe = "/media/caioh/EXTERNAL_HDD1/TCC_CAIO/seccomp/exec_program_seccomp";
let seccomp_allowed_syscalls = "execve,brk,arch_prctl,access,openat,newfstatat,mmap,close,read,pread64,mprotect,set_tid_address,set_robust_list,prlimit64,munmap,getrandom,write,exit_group,exit,fstat,readlink,uname,access";
let apparmor_profile = '/media/caioh/EXTERNAL_HDD1/TCC_CAIO/servidor_nodejs/server/apps/**';

// Execute an app
app.post('/Execute/', async (req, res) =>
{
    // Input validation
    //console.log(`${req.body.app_name} : ${security_settings.safe_characters.test(req.body.app_name)}`);
    if( security_settings.safe_characters.test(req.body.app_name) && security_permissions.has(req.body.app_name) && security_permissions.get(req.body.app_name).has('execute'))
    {
        try
        {
            let files = await fs.promises.readdir(`./apps/${req.body.app_name}/bin`);
            //console.log(files.length);

            if(files.length == 0)
            {
                // all file are build in the tmpfs folder and only the binary is stored on the host
                // tmpfs limit to avoid zip bombs
                let { stdout, stderr } = await ExecFileAsync(`${seccomp_exe}`, [`--unshare`, `all-pid`, `--fork`, `--host-filesystem`, `--uid`, `1000`,`--gid`, `1000`, `--apparmor-profile-immediate`, `compilation_security_profile`, `--mount`, `tmpfs_device`, `/tmp`, `tmpfs`, 'MS_NODEV|MS_NOEXEC|MS_NOSUID', 'size=1G', `--mount`, `tmpfs_device_src`, `${__dirname}/apps/${req.body.app_name}/app_source`, `tmpfs`, 'MS_NODEV|MS_NOEXEC|MS_NOSUID', 'size=1G', `--no-seccomp`, `/media/caioh/EXTERNAL_HDD1/TCC_CAIO/conteiner_compilacao/build_executable.sh`, `${__dirname}/apps/${req.body.app_name}` ]);
                //console.log(stdout, stderr);
            }

            let app_to_execute = `${__dirname}/apps/${req.body.app_name}/bin/AppExecutable`;

            // Execution
            let { stdout, stderr } = await ExecFileAsync(`${seccomp_exe}`, [`--unshare`, `all`, `--fork`, `--uid`, `1000`,`--gid`, `1000`, '--no-seccomp', `--seccomp-syscalls`, `${seccomp_allowed_syscalls}`, `--pivot-root`, `${__dirname}/apps/${req.body.app_name}/bin`, `/AppExecutable`].concat(req.body.flags.split(' ')));

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
            Description: "Invalid characters or no permission to execute"
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

            // Shows all files
            if(req.params.pattern == '*')
            {
                serach_result = files
            }

            // Filter the results
            else
            {
                let search_pattern = new RegExp(`${req.params.pattern}`);
                serach_result = files.filter( (file) => { if(search_pattern.test(file)) {return file} } );
            }

            // Return file JSON
            // code
            let json_result = [];
            for(file of serach_result)
            {
                try{ json_result.push( JSON.parse(await fs.promises.readFile(`./apps/${file}/${file}.json`)) ); }

                catch(error)
                {
                    if(error.code == 'ENOENT' || error.code == 'ENOTDIR')
                    {
                        json_result.push({app: {name : file, description: "empty"}});
                    }
                }
            }


            res.json
            ({
                Status: 'OK',
                Serach_Result : serach_result,
                JSON_Result : json_result,
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
*/

app.delete('/Delete', async (req, res) =>
{
    // Input validation
    if( security_settings.safe_characters.test(req.body.app.name) && req.body.admin.token == security_settings.admin_token )
    {
        try
        {
            await fs.promises.rmdir(`./apps/${req.body.app.name}`, { recursive: true, force: true });

            res.json
            ({
                Status: 'OK',
                Operation: 'DELETE',
                Req: req.body
            });
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
            Description: 'Security error'
        });
    }
});

//let httpsServer = https.createServer(credentials, app);

port_listen = 3000;
app.listen(port_listen, () =>
{
    console.log(`Server: OK \nPort: ${port_listen} \n`);
    console.log(`http://127.0.0.1:${port_listen}/Admin/${security_settings.admin_token}/\n`);

    let browser_args = global_settings.browser_and_args.slice(1);

    ExecFileAsync( global_settings.browser_and_args[0], browser_args.concat([`http://127.0.0.1:${port_listen}/Admin/${security_settings.admin_token}/`]) );
});