
function WriteMessageOnDiv( data, html_id)
{
    console.log(data);

    // https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
    // Cria uma formatação parecida com "pretty-json"
    // 4 espacos para tabulação
    let data_result = JSON.stringify(data, null, 4)

    document.querySelector(html_id).innerText = data_result;
}


// Navigation

function HideAllSections()
{
    let all_sections = document.querySelectorAll(".section");
    for(section of all_sections)
    {
        section.style.display = "none";
    }
}

function HideAllSectionsExcept(section_execption)
{
    HideAllSections();
    document.querySelector(section_execption).style.display = "";
}

HideAllSectionsExcept("#home");

document.querySelector("#nav_home").onclick = () => {HideAllSectionsExcept("#home")}
document.querySelector("#nav_search").onclick = () => {HideAllSectionsExcept("#search")}
document.querySelector("#nav_security").onclick = () => {HideAllSectionsExcept("#security")}
document.querySelector("#nav_dev").onclick = () => {HideAllSectionsExcept("#dev")}

// -------------------------------------------------------------------------------------------------------------------------- //
// Search section

function QueryApps()
{
    console.log('QueryApps');
    let app_name = document.querySelector("#Search_App").value;

    $.ajax
    ({
        type: "get",
        url: `http://127.0.0.1:3000/GetApps/${app_name}`,
        success: (data) => {Search_JsonToHtml(data) }
    });
}

function Search_JsonToHtml(json)
{
    let html_output = "";

    for(app_entry of json.JSON_Result)
    {

        let html_card = `<div id="Search_Entry_Result_${app_entry.app.name}" >\n` +
                        `<h2>${app_entry.app.name}</h2> \n <p>Description : ${app_entry.app.description}</p> \n` +
                        `<p>Developer name : ${app_entry.app.developer_name}</p> \n` +
                        `<p>URL : ${app_entry.app.origin_url}</p> \n` +
                        `<button id="Search_Delete-${app_entry.app.name}" class="Search_Delete" >Delete</button>` +
                        `</div> <hr/>\n\n`;

        html_output += html_card;
    }

    document.querySelector("#Search_Results").innerHTML = html_output;

    // Add click event to all buttons
    for( btn of document.querySelectorAll(`.Search_Delete`) )
    {
        btn.addEventListener( 'click', (event) =>
        {
            let json_data = 
            {
                "app":
                {
                    "name": event.target.id.split('-')[1]
                },

                "admin":
                {
                    "token": window.location.href.split('/')[4]
                }
            }

            $.ajax({
                type: "delete",
                url: `http://127.0.0.1:3000/Delete`,
                data: JSON.stringify( json_data ),
                contentType: 'application/json',
                dataType: 'json',
                success: (data) => { console.log(data), QueryApps() }
            });

        })
    }
}

// Realiza uma pesquisa no banco
document.querySelector("#Search_App").onkeyup = (key_press) =>
{
    QueryApps();
}

// -------------------------------------------------------------------------------------------------------------------------- //
// Security section

let last_response = '';

document.querySelector('#Security_Default_Browser').onkeyup = (event) =>
{
    console.log(event);

    if(event.code == 'Enter')
    {
        let json_data = 
        {
            "settings": [["browser_and_args", document.querySelector('#Security_Default_Browser').value.split(' ')]],

            "admin":
            {
                "token": window.location.href.split('/')[4],
            }
        }

        $.ajax({
            type: "post",
            url: `http://127.0.0.1:3000/Admin/PersistentSettings`,
            data: JSON.stringify( json_data ),
            contentType: 'application/json',
            dataType: 'json',
            success: (data) => { console.log(data) }
        });
    }
}

function SecurityAddEventListener(btn_class, security_operation)
{
    for( btn of document.querySelectorAll(btn_class) )
    {
        btn.addEventListener( 'click', (event) =>
        {

            let checkbox_values = [];
            let app_name = event.target.id.split('-')[1];

            for(node of document.querySelectorAll(`.Permission-${app_name}:checked`))
            {
                checkbox_values.push(node.value);
            }

            let json_data = 
            {
                "app":
                {
                    "name": app_name,
                    "permissions": checkbox_values
                },

                "admin":
                {
                    "token": window.location.href.split('/')[4],
                    "security_operation": security_operation
                }
            }

            $.ajax({
                type: "post",
                url: `http://127.0.0.1:3000/Admin/SetAppPermissions`,
                data: JSON.stringify( json_data ),
                contentType: 'application/json',
                dataType: 'json',
                success: (data) => { console.log(data) }
            });
        })
    }
}

function SecurityWriteOnChange(json, html_id)
{
    let stringified_json = JSON.stringify(json);

    let html_output_requests = '';
    let html_output_permissions = '';

    for(current_permission of json.Current_Permissions)
    {
        let app_name = current_permission[0];
        let permissions_string = current_permission[1].toString().replaceAll(',', ', ');

        permissions_string == ''? permissions_string = 'none': permissions_string;

        html_output_permissions += `<div id=Security_Current_Permission-${app_name} >\n` +
                                `<ul><li> <h3 class="Security_Current_Permission" >${app_name}</h3> </li></ul> \n ` +
                                `<p>Current permissions : ${permissions_string}</p> \n` +
                                `<button id="Security_Reset_Current-${app_name}" class="Security_Reset_Current" >RESET</button>` +
                                `</div> <hr/>\n\n`;
    }

    for(request of json.Permissions_requests)
    {
        let app_name = request[0];
        let permissions_string = request[1].toString().replaceAll(',', ', ');

        permissions_string == ''? permissions_string = 'none': permissions_string;

        html_output_requests += `<div id=Security_Request_${app_name} >\n` +
                                `<ul><li> <h3>${app_name}</h3> </li></ul>\n ` +
                                `<p>Requested permissions : ${permissions_string}</p> \n` +
                                `<input type = "checkbox" class="Permisson Permission-${app_name}" id='Execute-${app_name}' name="Execute-${app_name}" value="execute">` +
                                `<label class="Permission_Label" for = "Execute-${app_name}"> Execute </label> </br>\n` +

                                `<input type = "checkbox" class="Permisson Permission-${app_name}" id='Register-${app_name}' name="Register-${app_name}" value="register">` +
                                `<label class="Permission_Label" for = "Register-${app_name}"> Register </label> </br>\n` +

                                `<input type = "checkbox" class="Permisson Permission-${app_name}" id='Update-${app_name}' name="Update-${app_name}" value="update">` +
                                `<label class="Permission_Label" for="Update-${app_name}"> Update </label> </br>\n` +

                                `<button id="Security_Allow-${app_name}" class="Security_Allow" >ALLOW</button>` +
                                `<button id="Security_Deny-${app_name}" class="Security_Deny" >DENY</button>` +
                                `</div> <hr/>\n\n`;
    }

    if(last_response != stringified_json)
    {
        last_response = stringified_json;
        document.querySelector(html_id[0]).innerHTML = html_output_requests;
        document.querySelector(html_id[1]).innerHTML = html_output_permissions;

        SecurityAddEventListener('.Security_Allow', "permissions_add");
        SecurityAddEventListener('.Security_Deny', "deny_request");

        for( btn of document.querySelectorAll('.Security_Reset_Current') )
        {
            btn.addEventListener( 'click', (event) =>
            {
                let app_name = event.target.id.split('-')[1];

                let json_data = 
                {
                    "app":
                    {
                        "name": app_name
                    },

                    "admin":
                    {
                        "token": window.location.href.split('/')[4],
                        "security_operation": 'permissions_revoke_all'
                    }
                }
    
                $.ajax({
                    type: "post",
                    url: `http://127.0.0.1:3000/Admin/SetAppPermissions`,
                    data: JSON.stringify( json_data ),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: (data) => { console.log(data) }
                });
            })
        }
    }
}

function ReadSecurityPermissions()
{
    let json_data = 
    {
        "admin":
        {
            "token": window.location.href.split('/')[4]
        }
    }

    $.ajax({
        type: "post",
        url: `http://127.0.0.1:3000/Admin/RequestAppPermissions`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { SecurityWriteOnChange(data, ['#Security_Requests', '#Current_Security_Permissions']) }
    });
}

function SetPersistentSecuritySettings(operation)
{
    let json_data = 
    {
        "admin":
        {
            "token": window.location.href.split('/')[4],
            "operation": operation
        }
    }

    $.ajax({
        type: "post",
        url: `http://127.0.0.1:3000/Admin/PermissionPersistentSettings`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { console.log(data) }
    });
}

document.querySelector('#Security_Reset_And_SaveBtn').onclick = () => { SetPersistentSecuritySettings('reset_permissions') }
document.querySelector('#Security_Save_Current_PermissionsBtn').onclick = () => { SetPersistentSecuritySettings('save_current_permissions') }

setInterval( ReadSecurityPermissions, 1000)

// -------------------------------------------------------------------------------------------------------------------------- //
// Dev section

my_result_div = document.querySelector("#Result");

// Escreve a mensagem no campo apropriado
function WriteMessage( data )
{
    console.log(data);

    // https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
    // Cria uma formatação parecida com "pretty-json"
    // 4 espacos para tabulação
    let data_result = JSON.stringify(data, null, 4)

    my_result_div.innerText = data_result;
}

// Realiza uma pesquisa no banco
document.querySelector("#Dev_SearchBtn").onclick = () =>
{
    let app_name = document.querySelector("#Dev_Search_App").value;

    $.ajax
    ({
        type: "get",
        url: `http://127.0.0.1:3000/GetApps/${app_name}`,
        success: (data) => { WriteMessage(data) }
    });
}

// Requests permissions
document.querySelector("#RequestPermissionAppBtn").onclick = () =>
{

    let checkbox_values = [];

    for(node of document.querySelectorAll('.Dev_Permission:checked'))
    {
        checkbox_values.push(node.value);
    }

    let json_data = 
    {
        "app":
        {
            "name": document.querySelector("#Security_Request_App_Name").value,
            "permissions": checkbox_values
        }
    }

    $.ajax({
        type: "post",
        url: `http://127.0.0.1:3000/RequestAppPermissions`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { WriteMessage(data) }
    });
}

// Registra uma aplicativo e seu desenvolvedor
document.querySelector("#RegisterAppBtn").onclick = () =>
{
    let json_data = 
    {
        "app":
        {
            "name": document.querySelector("#Insert_App_Name").value,
            "developer_name": document.querySelector("#Insert_App_Dev_Name").value,
            "origin_url": document.querySelector("#Insert_App_Origin_URL").value,
            "description": document.querySelector("#Insert_App_Description").value,
        }
    }

    $.ajax({
        type: "post",
        url: `http://127.0.0.1:3000/RegisterApp`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { WriteMessage(data) }
    });
}

// Executa um aplicativo
document.querySelector("#ExecuteApp").onclick = () =>
{
    let json_data = 
    {
        "app_name": document.querySelector("#Execute_App_Name").value,
        "flags": document.querySelector("#Execute_App_Flags").value
    }

    $.ajax({
        type: "post",
        url: `http://127.0.0.1:3000/Execute`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { WriteMessage(data) }
    });
}

// Delete an entry
document.querySelector("#DeleteEntryBtn").onclick = () =>
{
    let json_data = 
    {
        "app":
        {
            "name": document.querySelector("#Delete_App").value
        },

        "admin":
        {
            "token": window.location.href.split('/')[4]
        }
    }

    $.ajax({
        type: "delete",
        url: `http://127.0.0.1:3000/Delete`,
        data: JSON.stringify( json_data ),
        contentType: 'application/json',
        dataType: 'json',
        success: (data) => { WriteMessage(data) }
    });
}