Module['onRuntimeInitialized'] = async () =>
{
    let runtime_initialized_time = performance.now() - global_start;
    let timings_list = [];
    let exit_code;

    for(let i=0; i<NUMBER_OF_EXECUTIONS; ++i)
    {
        start = performance.now();
        exit_code = await callMain([ ARGUMENTS ]);
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
            Test_program: document.querySelector('title').innerText,
            Args: [ARGUMENTS].join(" "),
            Type: 'web_wasm',
            Exit_code: exit_code,
            Miliseconds: timings_list/*.map((value) => `${value}ms`)*/.join(" "),
            Microseconds: timings_list.map((value) => value*1000).join(" "),
            Nanoseconds: '',
            Runtime_startup_time_miliseconds: runtime_initialized_time
        })
    })
    .then(res => res.json())
    .then(res => {console.log(res); open(res.New_link, '_self'); })
}