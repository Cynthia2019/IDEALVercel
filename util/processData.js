import sigFigs from './convertTo4SigFig';

function expo(x, f) {
    return Number.parseFloat(x).toExponential(f);
}

const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

const processData = (d, i) => {
        console.log('processData')
        let youngs = d.youngs?.match(regex)?.map(parseFloat);
        youngs = youngs.map((young) => sigFigs(young, 4));
        let poisson = d.poisson?.match(regex)?.map(parseFloat);
        poisson = poisson.map((p) => sigFigs(p, 4));

    // !i ? console.log('index', i, d) : null;
        let processed = {
          index: i, 
          name: d.dataset_name, 
          color: d.dataset_color,
          C11: sigFigs(parseFloat(d.C11), 4).toExponential(4),
          C12: sigFigs(parseFloat(d.C12), 4),
          C22: sigFigs(parseFloat(d.C22), 4).toExponential(4),
          C16: sigFigs(parseFloat(d.C16), 4),
          C26: sigFigs(parseFloat(d.C26), 4).toExponential(4),
          C66: sigFigs(parseFloat(d.C66), 4).toExponential(4),
          condition: d.condition,
          symmetry: d.symmetry,
          CM0: d.CM0,
          CM1: d.CM1,
          CM0_E: d.CM0_E,
          CM0_nu: d.CM0_nu,
          CM1_E: d.CM1_E,
          CM1_nu: d.CM1_nu,
          geometry: d.geometry_full,
          youngs: youngs,
          poisson: poisson,
          "Minimal directional Young's modulus [N/m]": Math.min(...(youngs || [])),
          "Maximal directional Young's modulus [N/m]": Math.max(...(youngs || [])),
          "Minimal Poisson's ratio [-]": Math.min(...(poisson || [])),
          "Maximal Poisson's ratio [-]": Math.max(...(poisson || [])),
        };
    return processed
      
}


// const processData = (data) => {
//   console.log(data)
//     return data.map((d, i) => {
//         let youngs = d.youngs?.match(regex).map(parseFloat);
//         let poisson = d.poisson?.match(regex).map(parseFloat);
//         let processed = {
//           index: i, 
//           C11: parseFloat(d.C11),
//           C12: parseFloat(d.C12),
//           C22: parseFloat(d.C22),
//           C16: parseFloat(d.C16),
//           C26: parseFloat(d.C26),
//           C66: parseFloat(d.C66),
//           condition: d.condition,
//           symmetry: d.symmetry,
//           CM0: d.CM0,
//           CM1: d.CM1,
//           CM0_E: d.CM0_E,
//           CM0_nu: d.CM0_nu,
//           CM1_E: d.CM1_E,
//           CM1_nu: d.CM1_nu,
//           geometry: d.geometry_full,
//           youngs: youngs,
//           poisson: poisson,
//           "Minimal directional Young's modulus [N/m]": Math.min(...(youngs || [])),
//           "Maximal directional Young's modulus [N/m]": Math.max(...(youngs || [])),
//           "Minimal Poisson's ratio [-]": Math.min(...(poisson || [])),
//           "Maximal Poisson's ratio [-]": Math.max(...(poisson || [])),
//         };
//         return processed;
//       })
// }

export default processData; 