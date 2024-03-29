import React from 'react';
import Plot from "react-plotly.js";

export default function poisson({dataPoint}) {
    var trace1 = {
        theta: [0., 3.6, 7.2, 10.8, 14.4, 18., 21.6, 25.2, 28.8, 32.4, 36., 39.6,
            43.2, 46.8, 50.4, 54., 57.6, 61.2, 64.8, 68.4, 72., 75.6, 79.2, 82.8,
            86.4, 90., 93.6, 97.2, 100.8, 104.4, 108., 111.6, 115.2, 118.8, 122.4, 126.,
            129.6, 133.2, 136.8, 140.4, 144., 147.6, 151.2, 154.8, 158.4, 162., 165.6, 169.2,
            172.8, 176.4, 180., 183.6, 187.2, 190.8, 194.4, 198., 201.6, 205.2, 208.8, 212.4,
            216., 219.6, 223.2, 226.8, 230.4, 234., 237.6, 241.2, 244.8, 248.4, 252., 255.6,
            259.2, 262.8, 266.4, 270., 273.6, 277.2, 280.8, 284.4, 288., 291.6, 295.2, 298.8,
            302.4, 306., 309.6, 313.2, 316.8, 320.4, 324., 327.6, 331.2, 334.8, 338.4, 342.,
            345.6, 349.2, 352.8, 356.4, 360.],
        r: dataPoint.poisson,
        mode: 'lines',
        name: 'Poisson\'s Ratio',
        line: {color: 'peru'},
        type: 'scatterpolar'

    };
    var data = [trace1];
    var layout = {
        title: {
            text: '<b>Poisson\'s Ratio</b>',
            // yref: 'paper',
            // y: 0.95,
        },
        // automargin: true,
        font: {
            family: 'Arial, sans-serif',
            size: 12,
            color: '#000'
        },
        orientation: -90,
        width: 230,
        height: 230,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 2]
            }
        },
        margin: {
            b: 20,
            t: 80,
            l: 40,
            r: 40,
        },
        // margin: {
        //     pad: 1000,
        // }

    };
    var config = {
        modeBarButtonsToRemove: ['zoom2d'],
        responsive: true
    }
    var style = {
        marginTop: '30px'
    }
    return (
        <Plot
            data={data}
            layout={layout}
            config={config}
            style={style}
            useResizeHandler={true}
        />
    );
}

