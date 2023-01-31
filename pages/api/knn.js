export async function getKnn(req) {
    console.log(req)
    const response = await fetch(`http://localhost:8000/model?data=${req}`)
    const jsonData = await response.json()
    return jsonData
}