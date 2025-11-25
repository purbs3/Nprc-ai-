import React from 'react';

interface HamburgerCrossIconProps {
    isOpen: boolean;
}

const HamburgerCrossIcon: React.FC<HamburgerCrossIconProps> = ({ isOpen }) => {
    const genericHamburgerLine = `h-0.5 w-6 my-1 rounded-full bg-white transition ease transform duration-300`;

    return (
        <div className="flex h-6 w-6 flex-col items-center justify-center">
            <div
                className={`${genericHamburgerLine} ${isOpen ? "translate-y-1.5 rotate-45" : ""
                    }`}
            />
            <div className={`${genericHamburgerLine} ${isOpen ? "opacity-0" : ""}`} />
            <div
                className={`${genericHamburgerLine} ${isOpen ? "-translate-y-1.5 -rotate-45" : ""
                    }`}
            />
        </div>
    );
};

export default HamburgerCrossIcon;
