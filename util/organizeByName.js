 const organizeByName = (data) => {
    const dataset_names = [...new Set(data.map(d => d.name))]; 

    let datasets = []

    dataset_names.map((name, i) => {
        datasets.push({
            name: name,
            color: data.filter(d => d.name === name)[0].color,
            data: data.filter(d => d.name === name)
        })
    })

    return datasets
}

export default organizeByName;