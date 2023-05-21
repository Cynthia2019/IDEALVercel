export async function handler(req) {
    const env = process.env.NODE_ENV
 //   let url= 'http://localhost:8000/model?data='
    let url = 'https://metamaterials-srv.northwestern.edu/model?data='
    if (env == 'production') {
        url = 'https://metamaterials-srv.northwestern.edu/model?data='
    }
    const body = req.body
    const response = await fetch(`${url}${body}`)
    const jsonData = await response.json()
    return jsonData
}