
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

async function Search_JsonToHtml(json)
{
    console.log(json);

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
        btn.addEventListener( 'click', (event) => {console.log(event.target);} )
    }
}


// Realiza uma pesquisa no banco
document.querySelector("#Search_App").onkeyup = (key_press) =>
{
    let app_name = document.querySelector("#Search_App").value;

    $.ajax
    ({
        type: "get",
        url: `http://127.0.0.1:3000/GetApps/${app_name}`,
        success: (data) => {Search_JsonToHtml(data) }
    });
}

// -------------------------------------------------------------------------------------------------------------------------- //
// Security section

let last_response = '';

function WriteOnChange(json, html_id)
{
    let stringified_json = JSON.stringify(json);

    let html_output_total = '';
    let html_output_requests = '';
    let html_output_permissions = '';

    for(request of json.Permissions_requests)
    {
        let app_name = request[0];
        let permissions_string = request[1].toString();

        permissions_string == ''? permissions_string = 'none': permissions_string;

        html_output_requests += `<div id=Security_Request_${app_name} >\n` +
                                `<h3>${app_name}</h3> \n ` +
                                `<p>Requested permissions : ${permissions_string}</p> \n` +
                                `<input type = "checkbox" class="Permisson Permission-${app_name}" name="execute" value="execute">` +
                                `<label for = "execute"> Execute </ label> </br>\n` +
                                `<input type = "checkbox" class="Permisson Permission-${app_name}" name="register" value="register">` +
                                `<label for = "register"> Register </ label> </br>\n` +
                                `<input type = "checkbox" class="Permisson Permission-${app_name}" name="update" value="update">` +
                                `<label for = "update"> Update </ label> </br>\n` +
                                `<button id="Security_Allow-${app_name}" class="Security_Allow" >ALLOW</button>` +
                                `<button id="Security_Deny-${app_name}" class="Security_Allow" >DENY</button>` +
                                `</div> <hr/>\n\n`;
    }

    if(last_response != stringified_json)
    {
        last_response = stringified_json;
        document.querySelector(html_id).innerHTML = html_output_requests;
        //WriteMessageOnDiv(json, html_id);

        console.log(stringified_json);
    }
}

function ReadSecurityPermissions()
{
    let json_data = 
    {
        "app":
        {
            "name": document.querySelector("#Insert_App_Name").value,
            "developer_name": document.querySelector("#Insert_App_Dev_Name").value,
            "origin_url": document.querySelector("#Insert_App_Origin_URL").value,
            "description": document.querySelector("#Insert_App_Description").value,
        },

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
        success: (data) => { WriteOnChange(data, '#Security_Requests') }
    });
}

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
    let json_data = 
    {
        "app":
        {
            "name": document.querySelector("#Security_Request_App_Name").value,
            "permissions": document.querySelector("#Security_Request_Permissions").value.split(' ')
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

// Deleta uma entrada
document.querySelector("#DeleteEntryBtn").onclick = () =>
{

    let json_data = 
    {
        "app_name": document.querySelector("#Delete_App").value
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