import styles from "@/styles/home.pairwise.module.css";
import { useEffect } from "react";


const MaterialInformation = ({dataPoint, open}) => {
    return (
        <div className={styles.materialInformation}>
            <div className={styles["content-line"]}>
                <p className={styles["data-title"]}>Material Information</p>
            </div>
            <div className={`${open ? styles["mat-content"] : styles["mat-content-closed"]}`}>
                <div className={styles['mat-subtitle-line']}>
                    <div style={{background: 'white', border: '1px solid black', width: '10px', height: '10px'}}></div>
                    <h3 style={{margin: '0 10px'}}>Constituent Material 0 Properties</h3>
                </div>
                {/*<div className={styles['mat-content-line']}>Type: {dataPoint?.CM0}</div>*/}
                <div className={styles['mat-content-line']}>Young&apos;s Modulus: {dataPoint?.CM0_E? dataPoint.CM0_E : "N/A"}</div>
                <div className={styles['mat-content-line']}>Poisson&apos;s Ratio: {dataPoint?.CM0_nu? dataPoint.CM0_nu : "N/A"}</div>
                <div className={styles['materialInformation-black']}>
                    <div className={styles['mat-subtitle-line']}>
                        <div style={{
                            background: 'black',
                            border: '1px solid black',
                            width: '10px',
                            height: '10px'
                        }}></div>
                        <h3 style={{margin: '0 10px'}}>Constituent Material 1 Properties</h3>
                    </div>
                    <div className={styles['mat-content-line']}>Young&apos;s Modulus: {dataPoint?.CM1_E? dataPoint.CM1_E : "N/A"}</div>
                    <div className={styles['mat-content-line']}>Poisson&apos;s Ratio: {dataPoint?.CM1_nu? dataPoint.CM1_nu : "N/A"}</div>
                </div>
            </div>
        </div>
    );
};

export default MaterialInformation;