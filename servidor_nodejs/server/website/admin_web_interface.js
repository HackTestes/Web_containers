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

HideAllSectionsExcept("#search");

document.querySelector("#nav_home").onclick = () => {HideAllSectionsExcept("#home")}
document.querySelector("#nav_search").onclick = () => {HideAllSectionsExcept("#search")}
document.querySelector("#nav_security").onclick = () => {HideAllSectionsExcept("#security")}
document.querySelector("#nav_config").onclick = () => {HideAllSectionsExcept("#configuration")}
document.querySelector("#nav_dev").onclick = () => {HideAllSectionsExcept("#dev")}

// -------------------------------------------------------------------------------------------------------------------------- //
// Search section

async function Search_JsonToHtml(json)
{
    console.log(json);

    let html_output = "";

    for(app_entry of json.JSON_Result)
    {
        let html_card = `<div id="Search_Entry_Result_${app_entry.app.name}" >\n`;
        html_card += `<h2>${app_entry.app.name}</h2> \n <p>Description : ${app_entry.app.description}</p> \n <p>Developer name : ${app_entry.app.developer_name}</p> \n <p>URL : ${app_entry.app.origin_url}</p> \n`;


        html_card += `<button id="Search_Delete-${app_entry.app.name}" class="Search_Delete" >Delete</button>`;

        html_output += html_card + "</div> <hr/>\n\n";
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
    //if(key_press.key == 'Enter')
    //{
        let app_name = document.querySelector("#Search_App").value;

        $.ajax
        ({
            type: "get",
            url: `http://127.0.0.1:3000/GetApps/${app_name}`,
            success: (data) => {Search_JsonToHtml(data) }
        });
    //}
}

// -------------------------------------------------------------------------------------------------------------------------- //


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
        "app_key": document.querySelector("#Execute_App_Key").value,
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

// Atualiza uma entrada
document.querySelector("#UpdateEntryBtn").onclick = () =>
{
    let new_value = document.querySelector("#Update_Table_Column_Value").value;

    let json_data = 
    {
        "table": document.querySelector("input[type='radio'][name='Update_Table_Select']:checked").value,
        "column": document.querySelector('#Update_Table_Column_Name').value,
        "ID": document.querySelector('#Update_Table_Entry_ID').value,
        "new_value": (new_value == "") ? null : new_value, // Se nulo, envie o valor null
    }

    $.ajax({
        type: "patch",
        url: `http://127.0.0.1:3000/UpdateEntry`,
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