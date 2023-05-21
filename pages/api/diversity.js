export async function getDiversity(body) {
    const env = process.env.NODE_ENV
    let url= 'http://localhost:8000/diversity/'
    if (env == 'production') {
        url = 'https://metamaterials-srv.northwestern.edu/diversity'
    }
    const response = await fetch(`${url}`, 
    {
        body: body, 
        method: "POST"
    })
    const jsonData = await response.json()
    return jsonData
}