import styles from "@/styles/home.pairwise.module.css";
import { Typography } from "@mui/material";
import { useEffect } from "react";


const MaterialInformation = ({dataPoint, open}) => {
    return (
        <div className={styles.materialInformation}>
            <div className={styles["content-line"]}>
                <Typography color="textPrimary" className={styles["data-title"]}>Material Information</Typography>
            </div>
            <div className={`${open ? styles["mat-content"] : styles["mat-content-closed"]}`}>
                <div className={styles['mat-subtitle-line']}>
                    <div style={{background: 'white', border: '1px solid black', width: '10px', height: '10px'}}></div>
                    <Typography variant="body" color="textPrimary" style={{margin: '0 10px'}}>Constituent Material 0 Properties</Typography>
                </div>
                <Typography variant="body" color="textPrimary" className={styles['mat-content-line']}>Young&apos;s Modulus: {dataPoint?.CM0_E? dataPoint.CM0_E : "N/A"}</Typography>
                <Typography variant="body" color="textPrimary" className={styles['mat-content-line']}>Poisson&apos;s Ratio: {dataPoint?.CM0_nu? dataPoint.CM0_nu : "N/A"}</Typography>
                <div className={styles['materialInformation-black']}>
                    <div className={styles['mat-subtitle-line']}>
                        <div style={{
                            background: 'black',
                            border: '1px solid black',
                            width: '10px',
                            height: '10px'
                        }}></div>
                       <Typography variant="body" color="textPrimary" style={{margin: '0 10px'}}>Constituent Material 1 Properties</Typography>
                    </div>
                    <Typography variant="body" color="textPrimary" className={styles['mat-content-line']}>Young&apos;s Modulus: {dataPoint?.CM1_E? dataPoint.CM1_E : "N/A"}</Typography>
                    <Typography variant="body" color="textPrimary" className={styles['mat-content-line']}>Poisson&apos;s Ratio: {dataPoint?.CM1_nu? dataPoint.CM1_nu : "N/A"}</Typography>
                </div>
            </div>
        </div>
    );
};

export default MaterialInformation;