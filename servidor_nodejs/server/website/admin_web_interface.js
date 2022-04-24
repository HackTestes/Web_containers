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
document.querySelector("#nav_dev").onclick = () => {HideAllSectionsExcept("#dev")}

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
        "developer":
        {
            "name": document.querySelector("#Insert_App_Dev_Name").value,
            "home_page_url": document.querySelector("#Insert_App_Dev_Home_Page_URL").value
        },

        "app":
        {
            "name": document.querySelector("#Insert_App_Name").value,
            "origin_url": document.querySelector("#Insert_App_Origin_URL").value,
            "hash": document.querySelector("#Insert_App_Hash").value,
            "size": document.querySelector("#Insert_App_Size").value,
            "needs_build": document.querySelector('input[id="Insert_App_Needs_Build"]').checked
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