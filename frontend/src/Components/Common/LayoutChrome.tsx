import React, { useCallback, useEffect } from "react";
import withRouter from "./withRouter";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { PERLOADER_TYPES } from "../constants/layout";

const selectPreloader = createSelector(
    (state: any) => state.Layout,
    (layout) => layout.preloader
);

/** Back-to-top control and optional full-page preloader on route change (replaces theme customizer panel). */
const LayoutChrome = (props: any) => {
    const preloader = useSelector(selectPreloader);
    const pathName = props.router.location.pathname;

    useEffect(() => {
        const el = document.getElementById("preloader") as HTMLElement | null;
        if (!el) return;
        el.style.opacity = "1";
        el.style.visibility = "visible";
        const t = window.setTimeout(() => {
            el.style.opacity = "0";
            el.style.visibility = "hidden";
        }, 1000);
        return () => clearTimeout(t);
    }, [pathName]);

    const scrollFunction = useCallback(() => {
        const element = document.getElementById("back-to-top");
        if (!element) return;
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", scrollFunction, true);
        return () => window.removeEventListener("scroll", scrollFunction, true);
    }, [scrollFunction]);

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    return (
        <React.Fragment>
            <button
                type="button"
                onClick={toTop}
                className="btn btn-danger btn-icon"
                id="back-to-top"
            >
                <i className="ri-arrow-up-line"></i>
            </button>

            {preloader === PERLOADER_TYPES.ENABLE && (
                <div id="preloader">
                    <div id="status">
                        <div className="spinner-border text-primary avatar-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default withRouter(LayoutChrome);
