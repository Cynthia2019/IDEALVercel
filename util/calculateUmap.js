import { StandardScaler } from "@/components/shared/standardScaler";
import { UMAP } from "umap-js";
import organizeByName from "./organizeByName";

export const calculateUmap = (data, knn) => {
    let scaler = new StandardScaler();
    let properties = ["C11", "C12", "C22", "C16", "C26", "C66"];
    let datasets = [];

    const umap = new UMAP({
        nNeighbors: knn ? knn : 15,
    });

    let organizedData = organizeByName(data);

    let temp_data = [];
    organizedData.map((d, i) => {
        for (let data of d.data) {
            let temp_properties = [];
            for (let p of properties) {
                temp_properties.push(+data[p]);
            }
            temp_data.push(temp_properties);
        }
    });

    temp_data.length ? (temp_data = scaler.fit_transform(temp_data)) : null;
    temp_data.length ? umap.fit(temp_data) : null;

    organizedData.map((d, i) => {
        let temp_data2 = [];
        for (let data of d.data) {
            let temp_properties = [];
            for (let p of properties) {
                temp_properties.push(data[p]);
            }
            data.name = d.name;
            data.color = d.color;
            temp_data2.push(temp_properties);
        }

        temp_data2 = scaler.transform(temp_data2);
        let res = temp_data2.length ? umap.transform(temp_data2) : null;

        res
            ? res.map((p, i) => {
                    d.data[i]["X"] = p[0];
                    d.data[i]["Y"] = p[1];
                })
            : null;
        datasets.push(d.data);
    });
    return [].concat(...datasets);
}