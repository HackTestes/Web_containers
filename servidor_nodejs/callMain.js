Module['onRuntimeInitialized'] = () =>
{
    timings_list = []
    let runtime_initialized_time = performance.now() - global_start;

    for(let i=0; i<5; ++i)
    {
        start = performance.now();
        callMain([ ARGUMENTS ]);
        end = performance.now();

        timings_list.push(end - start);
    }


    fetch('http://127.0.0.1:3000/WASM/result/',
    {
        method: 'POST',
        headers:
        {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify
        ({
            Test_name: document.querySelector('title').innerText,
            Program_args: ARGUMENTS,
            Time_to_start_wasm_runtime_miliseconds: runtime_initialized_time,
            Timings_miliseconds: timings_list
        })
    })
    .then(res => res.json())
    .then(res => {console.log(res); open(res.New_link, '_self'); })

}