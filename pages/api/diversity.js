export async function getDiversity(body) {
    const env = process.env.NODE_ENV
    let url= 'http://localhost:8000/diversity/'
    if (env == 'production') {
//        url = 'https://ideal-server-espy0exsw-cynthia2019.vercel.app/diversity/'
    }
    const response = await fetch(`${url}`, 
    {
        body: body, 
        method: "POST"
    })
    const jsonData = await response.json()
    return jsonData
}