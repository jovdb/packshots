const checkBoardSize = 25;
const checkBoardDark = "#e8e8e8";
const checkBoardLight = "#f8f8f8";

export const checkBoardStyle = {
    // checkboard background
    backgroundImage: `
        linear-gradient(45deg, ${checkBoardDark} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
        linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
        linear-gradient(45deg, ${checkBoardDark} 25%, ${checkBoardLight} 25%)`,
    backgroundSize: `${checkBoardSize}px ${checkBoardSize}px`,
    backgroundPosition: `
        0 0,
        0 0,
        calc(${checkBoardSize}px * -0.5) calc(${checkBoardSize}px * -0.5),
        calc(${checkBoardSize}px * 0.5) calc(${checkBoardSize}px * 0.5)`,
};