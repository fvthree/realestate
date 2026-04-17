import React from "react";

const Navdata = () => {
    const menuItems: any = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "properties",
            label: "Properties",
            icon: "ri-building-2-line",
            link: "/properties",
        },
    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
