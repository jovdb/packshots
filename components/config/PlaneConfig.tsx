import { useState } from "react";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";
import { SpreadImageConfig } from "./SpreadImageConfig";

export interface IImageConfig {
    imageUrl: string;
}

export const ImageConfig: ConfigComponent<IImageConfig> = ({
    config,
    onChange,
}) => {

    return (
        <>
            <SpreadImageConfig />
        </>
    );
}