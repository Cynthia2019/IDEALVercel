import classNames from "classnames";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {useState, useMemo} from "react";
import Header from "./shared/header";
import styles from "../styles/Home.module.css";
import UmapWrapper from "./umap/umapWrapper";
import StructureWrapper from "../components/structureWrapper";
import {csv, csvParse} from "d3";
import dynamic from "next/dynamic";
import Umap_DataSelector from "../components/umap_dataSelector";
//import DataSelector from "../components/dataSelector";
import RangeSelector from "./shared/rangeSelector";
import MaterialInformation from "../components/materialInfo";
import SavePanel from "../components/savePanel";
import {Row, Col} from "antd";
import {GetObjectCommand, ListObjectsCommand} from "@aws-sdk/client-s3";
import {s3BucketList, colorAssignment} from '@/util/constants'
import processData from "../util/processData";

import {
    ArticleIcon,
    CollapsIcon,
    HomeIcon,
    LogoIcon,
    LogoutIcon,
    UsersIcon,
    VideosIcon,
} from "./icons";

const menuItems = [
    {id: 1, label: "Dataset", icon: HomeIcon, link: "/test"},
    {id: 2, label: "Range selector", icon: ArticleIcon, link: "/posts"},
    {id: 3, label: "Axis selection", icon: UsersIcon, link: "/users"},
    {id: 4, label: "Materials Information", icon: VideosIcon, link: "/tutorials"},
];

const Sidebar = () => {
    const [toggleCollapse, setToggleCollapse] = useState(false);
    const [isCollapsible, setIsCollapsible] = useState(false);

    const router = useRouter();

    const activeMenu = useMemo(
        () => menuItems.find((menu) => menu.link === router.pathname),
        [router.pathname]
    );

    const wrapperClasses = classNames(
        "h-screen px-4 pt-8 pb-4 bg-light flex justify-between flex-col",
        {
            ["w-80"]: !toggleCollapse,
            ["w-20"]: toggleCollapse,
        }
    );

    const collapseIconClasses = classNames(
        "p-4 rounded bg-light-lighter absolute right-0",
        {
            "rotate-180": toggleCollapse,
        }
    );

    const getNavItemClasses = (menu) => {
        return classNames(
            "flex items-center cursor-pointer hover:bg-light-lighter rounded w-full overflow-hidden whitespace-nowrap",
            {
                ["bg-light-lighter"]: activeMenu.id === menu.id,
            }
        );
    };

    const onMouseOver = () => {
        setIsCollapsible(!isCollapsible);
    };

    const handleSidebarToggle = () => {
        setToggleCollapse(!toggleCollapse);
    };

    return (
        <div
            className={wrapperClasses}
            onMouseEnter={onMouseOver}
            onMouseLeave={onMouseOver}
            style={{transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s"}}
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between relative">
                    <div className="flex items-center pl-1 gap-4">
                        <LogoIcon/>
                        <span
                            className={classNames("mt-2 text-lg font-medium text-text", {
                                hidden: toggleCollapse,
                            })}
                        >
              Logo
            </span>
                    </div>
                    {isCollapsible && (
                        <button
                            className={collapseIconClasses}
                            onClick={handleSidebarToggle}
                        >
                            <CollapsIcon/>
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-start mt-24">
                    {menuItems.map(({icon: Icon, ...menu}) => {
                        const classes = getNavItemClasses(menu);
                        return (
                            <div className={classes} key={menu.id}>
                                <Link legacyBehavior href={menu.link}>
                                    <a className="flex py-4 px-3 items-center w-full h-full">
                                        <div style={{width: "2.5rem"}}>
                                            <Icon/>
                                        </div>
                                        {!toggleCollapse && (
                                            <span
                                                className={classNames(
                                                    "text-md font-medium text-text-light"
                                                )}
                                            >
                        {menu.label}
                      </span>
                                        )}
                                    </a>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`${getNavItemClasses({})} px-3 py-4`}>
                <div style={{width: "2.5rem"}}>
                    <LogoutIcon/>
                </div>
                {!toggleCollapse && (
                    <span className={classNames("text-md font-medium text-text-light")}>
            Logout
          </span>
                )}
            </div>
        </div>
    );
};

export default Sidebar;