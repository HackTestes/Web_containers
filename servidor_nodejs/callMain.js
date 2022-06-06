Module['onRuntimeInitialized'] = async () =>
{
    timings_list = []
    let runtime_initialized_time = performance.now() - global_start;

    for(let i=0; i<4; ++i)
    {
        start = performance.now();
        await callMain([ ARGUMENTS ]);
        end = performance.now();

        timings_list.push(end - start);
    }

    timings_list_no_start = timings_list.slice(1);

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
            Program_args: [ARGUMENTS].join(" "),
            Time_to_start_wasm_runtime_miliseconds: `${runtime_initialized_time}ms`,
            Timings_miliseconds: timings_list.map((value) => `${value}ms`).join(" "),
            Avg_with_first_run: `${timings_list.reduce( (a, b) => a + b ) / timings_list.length}ms`,
            Average_no_first_run: `${timings_list_no_start.reduce( (a, b) => a + b ) / timings_list_no_start.length}ms`
        })
    })
    .then(res => res.json())
    .then(res => {console.log(res); open(res.New_link, '_blank'); })
}