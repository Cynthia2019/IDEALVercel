export async function getKnn(req) {
    const env = process.env.NODE_ENV
    let url= 'http://localhost:8000/model?data='
    if (env == 'production') {
        url = 'https://ideal-server-espy0exsw-cynthia2019.vercel.app/model?data='
    }
    const response = await fetch(`${url}${req}`)
    const jsonData = await response.json()
    return jsonData
}